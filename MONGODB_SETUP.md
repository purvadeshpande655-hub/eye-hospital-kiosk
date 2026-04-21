# MongoDB Atlas Setup for Vercel Deployment

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email

## Step 2: Create a Cluster
1. Click "Build a Database"
2. Select **M0 Sandbox** (Free tier)
3. Choose a cloud provider and region (closest to your users)
4. Name your cluster (e.g., "eye-hospital-cluster")
5. Click "Create Cluster"

## Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Username: `eye-hospital-user`
4. Password: Generate a strong password (save this!)
5. Permissions: Read and write to any database
6. Click "Add User"

## Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the connection string

## Step 6: Update Connection String
Replace `<password>` with your actual password:

```
mongodb+srv://eye-hospital-user:<password>@eye-hospital-cluster.xxxxx.mongodb.net/eyeHospital?retryWrites=true&w=majority
```

## Step 7: Add to Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Go to "Settings" -> "Environment Variables"
3. Add:
   - **Name**: `MONGODB_URI`
   - **Value**: Your connection string from Step 6
4. Click "Save"

## Step 8: Redeploy
1. Go to your Vercel project
2. Click "Redeploy" or push new commit to trigger deployment

## Example Connection String Format:
```
mongodb+srv://eye-hospital-user:yourStrongPassword123@eye-hospital-cluster.abcde.mongodb.net/eyeHospital?retryWrites=true&w=majority
```

## Troubleshooting:
- **Invalid URI**: Ensure no spaces and correct format
- **Authentication failed**: Check username/password
- **Network access**: Ensure IP whitelist includes 0.0.0.0/0
- **Cluster not ready**: Wait for cluster to be fully provisioned
