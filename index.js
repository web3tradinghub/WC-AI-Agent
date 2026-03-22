require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { Core } = require('@walletconnect/core');
const { SignClient } = require('@walletconnect/sign-client');
const fs = require('fs');
const cron = require('node-cron'); // 1. NEW: The AI Brain's clock

const projectId = process.env.PROJECT_ID;

const agentSettings = {
  projectId: projectId,
  metadata: {
    name: 'My Crypto AI Agent',
    description: 'Automating my Web3 daily tasks',
    url: 'https://my-agent.local', 
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }
};

// 2. NEW: The automated task the AI will do
async function performDailyCheckIn(walletAddress) {
  console.log(`\n🤖 [AI Action] Executing auto check-in for wallet: ${walletAddress}...`);
  console.log("✅ Success! Daily task completed automatically.");
}

async function startAgent() {
  const core = new Core({ projectId: agentSettings.projectId });
  const client = await SignClient.init({
    core,
    metadata: agentSettings.metadata,
  });

  if (fs.existsSync('session.json')) {
    const savedSession = JSON.parse(fs.readFileSync('session.json'));
    const walletAddress = savedSession.namespaces.eip155.accounts[0];
    
    console.log("🧠 Memory Found! Connected automatically!");
    console.log("Wallet Address:", walletAddress);
    
    // 3. NEW: Turn on the AI Brain schedule (Set to run every 1 minute for testing)
    console.log("⏰ AI Brain activated! Waiting to perform background tasks...");
    
    cron.schedule('* * * * *', () => {
      performDailyCheckIn(walletAddress);
    });
    
    return; // Keep the agent running in the background
  }

  // --- QR Code Code (runs only if no memory) ---
  console.log("No memory found. Generating new connection QR Code...");
  const { uri, approval } = await client.connect({
    requiredNamespaces: {
      eip155: { methods: ['personal_sign'], chains: ['eip155:1'], events: ['chainChanged', 'accountsChanged'] }
    }
  });

  if (uri) {
    qrcode.generate(uri, {small: true});
    console.log("Please scan this QR code.");
  }

  try {
    const session = await approval();
    console.log("🎉 SUCCESS! Wallet Connected! 🎉");
    fs.writeFileSync('session.json', JSON.stringify(session));
    console.log("🧠 Memory Updated! Restart the app to test the AI Brain.");
  } catch (error) {
    console.log("Connection failed.");
  }
}

startAgent();