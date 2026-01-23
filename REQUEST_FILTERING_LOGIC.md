# 📋 Open Requests Filtering Logic

## 🔍 Request Type Detection

The system now intelligently filters open requests based on their type:

### 1. **Specific Asset Requests**
**Detection:** `requestedAssets` array contains actual asset objects
```javascript
const isSpecificAssetRequest = request.requestedAssets && 
                              request.requestedAssets.length > 0 && 
                              typeof request.requestedAssets[0] === 'object';
```

**Filtering:** Only shows requests from **user's own department**
```javascript
if (isSpecificAssetRequest) {
    return request.scope?.departmentId === userDepartment;
}
```

**Example Request:**
```json
{
  "requestedAssets": [
    {
      "$oid": "69662fbc66ea44db13091a4b"
    }
  ],
  "scope": {
    "departmentId": "6960d7abffb708217feec351"
  }
}
```

### 2. **Generic Asset Requests**
**Detection:** Has `assetCategory` but no specific assets
```javascript
const isGenericAssetRequest = request.assetCategory && 
                              (!request.requestedAssets || request.requestedAssets.length === 0);
```

**Filtering:** Shows **all generic requests** regardless of department
```javascript
else if (isGenericAssetRequest) {
    return true; // Show all generic requests
}
```

**Example Request:**
```json
{
  "assetCategory": "biomedical",
  "assetName": "X-ray machine",
  "requestedAssets": [],
  "scope": {
    "departmentId": "6960d67affb708217feec34c"
  }
}
```

## 🎯 Filtering Rules

| Request Type | Detection Criteria | Filtering Rule | Visibility |
|--------------|-------------------|----------------|------------|
| **Specific Asset** | `requestedAssets` has objects | Same department only | Department-specific |
| **Generic Asset** | `assetCategory` + no assets | Show all | Organization-wide |
| **Other Types** | Default fallback | Show all | Organization-wide |

## 🧪 Debug Information

The console now shows detailed filtering logs:

```
Request ID: 696f5872165011099b9bb7e4
Is specific asset request: true
Is generic asset request: false
Request department: 6960d7abffb708217feec351
User department: 6960d7abffb708217feec351
Filtered requests count: 1
```

## 🔄 How It Works

1. **Fetch all open requests** from `/api/requests/open`
2. **Analyze each request** to determine its type
3. **Apply filtering logic** based on request type
4. **Display filtered results** in the dashboard

## 🎯 Benefits

✅ **Department-specific visibility** for specific asset requests
✅ **Organization-wide visibility** for generic requests
✅ **Smart detection** based on request structure
✅ **Detailed logging** for debugging
✅ **Flexible architecture** for future request types

## 🚀 Use Cases

- **Specific Asset Request:** Department A requests specific MRI machine → Only Department A sees it
- **Generic Asset Request:** Department B requests "2 X-ray machines" → All departments see it
- **Mixed Requests:** Users see relevant requests based on type and department

This ensures users only see the requests that are relevant to their role and department while maintaining visibility for generic organizational needs!
