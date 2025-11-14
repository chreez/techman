#!/bin/bash

echo "Testing Techman Stage 1 Implementation"
echo "======================================"

# Check if server is running
echo -n "1. Checking server health... "
curl -s http://localhost:3000/api/health | jq .

# Run workspace scanner
echo -e "
2. Running workspace scanner agent..."
curl -s -X POST http://localhost:3000/api/agents/workspace-scanner/run | jq .

# Wait for agent to complete
echo -e "
3. Waiting for agent to complete..."
sleep 3

# Check agent status
echo -e "
4. Checking agent status..."
curl -s http://localhost:3000/api/agents/workspace-scanner/status | jq .

# Query workspace data
echo -e "
5. Querying workspace data..."
curl -s http://localhost:3000/api/data/workspace | jq .

echo -e "
Stage 1 test complete!"