# Stage 2: Data Resilience

## Goal
Add schema versioning and graceful error handling to ensure:
- Schema changes don't break existing queries
- Failed agents don't crash the server
- Dashboard can handle missing or evolving data
- Data contracts are explicit and versioned

## Implementation
See the `implement-data-resilience` agent which will:
1. Add schema versioning tables
2. Create a schema registry module
3. Update endpoints for graceful failures
4. Implement flexible querying
5. Add migration support

## Success Criteria
- [ ] Can change agent output schema without breaking dashboard
- [ ] Server continues running even if agents fail
- [ ] Old data remains queryable with new schemas
- [ ] Schema versions are tracked
- [ ] Migrations can transform data between versions

## Key Components

### Schema Registry
- Tracks current version per agent
- Validates incoming data
- Provides default values
- Enables backward compatibility

### Graceful Failures
- Agent failures logged but don't crash
- Missing tables return empty data
- Invalid queries return structured errors
- API always returns valid JSON

### Data Contracts
```javascript
{
  agent_name: "workspace-scanner",
  version: 2,
  fields: [
    { name: "file_path", type: "TEXT", required: true },
    { name: "tags", type: "JSON", required: false, default: "[]" }
  ]
}
```

## Testing
Run the `implement-data-resilience` agent, then:
1. Change an agent's schema
2. Query old data - should still work
3. Kill an agent mid-run - server should continue
4. Query non-existent data - should return empty, not error
