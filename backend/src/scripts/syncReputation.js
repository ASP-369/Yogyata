// syncReputation.js
// Backend script to sync on-chain reputation to Supabase
// Run with: node src/scripts/syncReputation.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

// Contract ABI (only the functions we need)
const CONTRACT_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "reputation",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "isIssuer",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "isVerifier",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    }
];

const RPC_URL = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Service role client (backend only - has full access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper to normalize on-chain rep (assuming 1e18 scaling)
function normalizeRep(raw) {
    const SCALE = BigInt(10 ** 18);
    return Number(raw) / Number(SCALE);
}

/**
 * Sync a single teacher's on-chain reputation into Supabase.
 */
async function syncTeacherReputation(params) {
    const { address, institutionName, isIssuer, isVerifier } = params;

    try {
        const addr = ethers.getAddress(address); // checksum
        const rawRep = await contract.reputation(addr);
        const rep = normalizeRep(rawRep);

        const { error } = await supabase
            .from("Teacher")
            .upsert(
                {
                    id: addr.toLowerCase(),
                    institution_name: institutionName,
                    is_issuer: isIssuer,
                    is_verifier: isVerifier,
                    rep,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "id" }
            )
            .select()
            .single();

        if (error) {
            console.error("Error upserting teacher rep:", error);
            throw error;
        }

        console.log(`Synced ${addr}: rep=${rep}`);
        return { address: addr, rep };
    } catch (err) {
        console.error(`Failed to sync ${address}:`, err.message);
        throw err;
    }
}

/**
 * Bulk sync from a list of validator addresses.
 */
async function syncManyTeachers(teachers) {
    const rows = [];

    for (const t of teachers) {
        try {
            const addr = ethers.getAddress(t.address);
            const rawRep = await contract.reputation(addr);
            const rep = normalizeRep(rawRep);

            rows.push({
                id: addr.toLowerCase(),
                institution_name: t.institutionName,
                is_issuer: t.isIssuer,
                is_verifier: t.isVerifier,
                rep,
                updated_at: new Date().toISOString(),
            });
        } catch (err) {
            console.error(`Skipping ${t.address}:`, err.message);
        }
    }

    if (rows.length === 0) {
        console.log("No valid teachers to sync");
        return [];
    }

    const { data, error } = await supabase
        .from("Teacher")
        .upsert(rows, { onConflict: "id" })
        .select();

    if (error) {
        console.error("Bulk upsert error:", error);
        throw error;
    }

    console.log(`Synced ${rows.length} teachers`);
    return data;
}

/**
 * Sync all teachers in the database with their on-chain reputation
 */
async function syncAllTeachers() {
    console.log("Fetching all teachers with wallet addresses...");

    // Get all users with wallet addresses who are institutions
    const { data: authData } = await supabase.auth.admin.listUsers();

    if (!authData?.users) {
        console.log("No users found");
        return;
    }

    const institutionUsers = authData.users.filter(
        u => u.user_metadata?.role === 'institution' && u.user_metadata?.wallet_address
    );

    console.log(`Found ${institutionUsers.length} institution users with wallets`);

    for (const user of institutionUsers) {
        try {
            const walletAddress = user.user_metadata.wallet_address;
            const institutionName = user.user_metadata.institution_name || 'Unknown';

            // Check on-chain status
            const [isIssuer, isVerifier, rawRep] = await Promise.all([
                contract.isIssuer(walletAddress),
                contract.isVerifier(walletAddress),
                contract.reputation(walletAddress)
            ]);

            const rep = normalizeRep(rawRep);

            await supabase
                .from("Teacher")
                .upsert({
                    id: user.id,
                    institution_name: institutionName,
                    is_issuer: isIssuer,
                    is_verifier: isVerifier,
                    rep,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "id" });

            console.log(`✓ Synced ${walletAddress.slice(0, 8)}... : issuer=${isIssuer}, verifier=${isVerifier}, rep=${rep}`);
        } catch (err) {
            console.error(`✗ Failed to sync user ${user.id}:`, err.message);
        }
    }

    console.log("Sync complete!");
}

// Export functions for use as module
module.exports = {
    syncTeacherReputation,
    syncManyTeachers,
    syncAllTeachers,
    normalizeRep
};

// Run directly if executed as script
if (require.main === module) {
    syncAllTeachers()
        .then(() => {
            console.log("Done!");
            process.exit(0);
        })
        .catch(err => {
            console.error("Sync failed:", err);
            process.exit(1);
        });
}
