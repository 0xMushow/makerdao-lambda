# MakerDAO Automation Workable Alert

This project implements an AWS Lambda function to monitor MakerDAO jobs and send Discord alerts for jobs that haven’t been worked for the past 10 consecutive blocks.

## Features
- Fetches jobs from the Sequencer contract.
- Checks job workability using the IJob interface.
- Sends Discord alerts for non-workable jobs.

## Setup

### Prerequisites
- Node.js 18.x
- AWS CLI (optional, for deployment)
- AWS Account
- Discord server and webhook URL (owner permissions)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/0xMushow/makerdao-lambda.git
   cd makerdao-lambda
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   mv .env.example .env
   ```

   Update `.env` with your values:
   ```bash
   RPC_URL=your_ethereum_rpc_url
   SEQUENCER_ADDRESS=your_sequencer_contract_address
   DISCORD_WEBHOOK_URL=your_discord_webhook_url
   ```

### Build the Project
```bash
npm run build
```

### Run Locally
```bash
node dist/src/index.js
```

## Creating a Discord Webhook

To send alerts to Discord, you need to create a webhook. Follow these steps:

1. **Open Discord**:
    - Go to the server where you want to receive alerts.

2. **Go to Server Settings**:
    - Click the dropdown arrow next to your server name.
    - Select **Server Settings**.

3. **Navigate to Integrations**:
    - In the left sidebar, click **Integrations**.
    - Click **Webhooks**.

4. **Create a Webhook**:
    - Click **New Webhook**.
    - Choose the channel where you want to send alerts.
    - Customize the webhook name and avatar (optional).

5. **Copy the Webhook URL**:
    - Scroll down to the **Webhook URL** section.
    - Click **Copy** to copy the webhook URL.

6. **Add the Webhook URL to Your `.env` File**:
    - Open your `.env` file.
    - Add the webhook URL:
      ```bash
      DISCORD_WEBHOOK_URL=your_discord_webhook_url
      ```

## Deployment

### Option 1: AWS Management Console
1. Go to the [AWS Lambda Console](https://console.aws.amazon.com/lambda).
2. Create a new Lambda function:
    - Function name: `makerdao-lambda`
    - Runtime: Node.js 18.x
    - Handler: `dist/src/index.handler`
3. Upload the `lambda.zip` file:
   ```bash
   zip -r lambda.zip dist node_modules package.json
   ```
4. Set environment variables in the AWS Lambda Console.

### Option 2: AWS CLI
1. Install and configure the AWS CLI:
   ```bash
   aws configure
   ```
2. Deploy the Lambda function:
   ```bash
   aws lambda create-function \
   --function-name makerdao-lambda \
   --runtime nodejs18.x \
   --handler dist/src/index.handler \
   --zip-file fileb://lambda.zip \
   --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role
   ```

### EventBridge Scheduler
1. Go to the [EventBridge Scheduler Console](https://console.aws.amazon.com/scheduler).
2. Create a new schedule:
    - Schedule type: Recurring schedule
    - Frequency: Cron-based schedule
    - Cron expression: `cron(*/5 * * * ? *)`
    - Target: Your Lambda function ARN
3. Alternatively, use the AWS CLI:
   ```bash
   aws scheduler create-schedule \
   --name "5-minute-lambda" \
   --schedule-expression "cron(*/5 * * * ? *)" \
   --target '{
   "Arn": "arn:aws:lambda:YOUR_REGION:YOUR_ACCOUNT_ID:function:makerdao-lambda",
   "RoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/EventBridgeInvokeLambdaRole"
   }'
   ```

## Tests
Run unit tests:
```bash
npm test
```

## License
This project is licensed under the MIT License.