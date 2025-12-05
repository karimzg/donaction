# Exceptional Refund Workflow - Visual Guide

## Complete Process Flow

```mermaid
sequenceDiagram
    participant Donor
    participant SupportEmail as Support Email
    participant AssocLeader as Association Leader
    participant AdminDashboard as Admin Dashboard (/refunds)
    participant System as DONACTION System
    participant Stripe
    participant SuperAdmin

    Note over Donor,SuperAdmin: Phase 1: Request Initiation
    Donor->>SupportEmail: Email requesting refund
    SupportEmail->>AssocLeader: Forward refund request
    AssocLeader->>AdminDashboard: Login & navigate to /refunds
    AssocLeader->>AdminDashboard: Click "New Refund Request"

    Note over AssocLeader,AdminDashboard: Fill form (type, reason, amount)
    AdminDashboard->>System: Submit refund request
    System->>System: Create refund record (status: awaiting_declaration)
    System->>System: Log in FinancialAuditLog
    System->>Donor: Email: "Please sign declaration" (PDF attached)
    System->>AssocLeader: Email: "Refund request created, awaiting donor"

    Note over Donor,System: Phase 2: Donor Declaration
    Donor->>Donor: Download, sign PDF declaration
    Donor->>SupportEmail: Email signed declaration PDF
    SupportEmail->>AssocLeader: Forward signed declaration
    AssocLeader->>AdminDashboard: Upload declaration to refund request
    AdminDashboard->>System: Store declaration file
    System->>System: Update status: pending_approval
    System->>SuperAdmin: Email: "Refund request ready for approval"

    Note over AssocLeader,SuperAdmin: Phase 3: Approval
    alt Approved by Association Leader
        AssocLeader->>AdminDashboard: Review request & approve
    else Approved by SuperAdmin
        SuperAdmin->>AdminDashboard: Review request & approve
    end

    AdminDashboard->>System: Submit approval
    System->>System: Create ReceiptCancellation record
    System->>System: Generate cancellation attestation PDF
    System->>System: Update status: processing

    Note over System,Stripe: Phase 4: Stripe Refund
    System->>Stripe: API: Create refund
    Stripe-->>System: Refund ID + status
    System->>System: Update refund_status: completed
    System->>System: Link Stripe refund ID to donation
    System->>System: Log all actions in FinancialAuditLog

    Note over System,SuperAdmin: Phase 5: Notifications
    System->>Donor: Email: "Refund processed" (cancellation PDF attached)
    System->>AssocLeader: Email: "Refund completed for donation #123"
    System->>SuperAdmin: Email: "Refund audit notification"

    Note over System: Optional: Tax Authority Notification
    alt Fraud or Amount > Threshold
        System->>System: Flag for tax authority notification
        SuperAdmin->>System: Manual tax authority reporting
    end
```

## Simplified State Machine

```mermaid
stateDiagram-v2
    [*] --> AwaitingDeclaration: Refund request created
    AwaitingDeclaration --> PendingApproval: Declaration uploaded
    PendingApproval --> Approved: Admin approves
    PendingApproval --> Denied: Admin denies
    Approved --> Processing: System starts refund
    Processing --> Completed: Stripe refund succeeds
    Processing --> Failed: Stripe refund fails
    Denied --> [*]
    Completed --> [*]
    Failed --> PendingApproval: Manual retry
```

## Access Control Matrix

```mermaid
graph TD
    A[Refund Request] --> B{User Role}
    B -->|Superadmin| C[Full Access]
    B -->|Association Leader| D[Own Klub Only]
    B -->|Other User| E[No Access]

    C --> F[View All Requests]
    C --> G[Approve Any Request]
    C --> H[Deny Any Request]
    C --> I[View All Audit Logs]

    D --> J[View Own Requests]
    D --> K[Create Request]
    D --> L[Upload Declaration]
    D --> M[Approve Own Requests]
    D --> N[View Own Audit Logs]

    E --> O[403 Forbidden]
```

## Refund Request Status Flow

```mermaid
flowchart LR
    A[Donor requests refund] --> B[awaiting_declaration]
    B --> C{Declaration<br/>uploaded?}
    C -->|Yes| D[pending_approval]
    C -->|No| E[Send reminder email]
    E --> B

    D --> F{Admin<br/>decision?}
    F -->|Approve| G[approved]
    F -->|Deny| H[denied]

    G --> I[processing]
    I --> J{Stripe<br/>success?}
    J -->|Yes| K[completed]
    J -->|No| L[failed]

    H --> M[End: Refund denied]
    K --> N[End: Refund successful]
    L --> O[Manual intervention]

    style B fill:#fff3cd
    style D fill:#cfe2ff
    style G fill:#d1e7dd
    style H fill:#f8d7da
    style K fill:#d1e7dd
    style L fill:#f8d7da
```

## Key Decision Points

| Phase | Decision Point | Actors | Outcome |
|-------|---------------|--------|---------|
| **Initiation** | Is refund eligible? | Association Leader | Create request or reject |
| **Declaration** | Declaration valid? | Association Leader (upload) | Accept or request resubmission |
| **Approval** | Approve or deny? | Superadmin OR Association Leader | Approve → process / Deny → end |
| **Processing** | Stripe refund success? | System (automated) | Success → complete / Fail → manual intervention |
| **Completion** | Notify tax authorities? | System (auto) + Superadmin (manual) | Flag if fraud or > threshold |

## Email Notification Flow

```mermaid
graph TD
    A[Refund Request Created] --> B[Email to Donor:<br/>Sign declaration]
    A --> C[Email to Assoc Leader:<br/>Request created]

    D[Declaration Uploaded] --> E[Email to Superadmin:<br/>Ready for approval]

    F[Refund Approved] --> G[Email to Donor:<br/>Refund processing]
    F --> H[Email to Assoc Leader:<br/>Approved]

    I[Refund Completed] --> J[Email to Donor:<br/>Refund confirmed + PDF]
    I --> K[Email to Assoc Leader:<br/>Completed]
    I --> L[Email to Superadmin:<br/>Audit notification]

    M[Refund Denied] --> N[Email to Assoc Leader:<br/>Denied with reason]
```

## Technical Architecture

```mermaid
graph LR
    A[Angular Dashboard<br/>/refunds] --> B[Strapi API<br/>/refund-manager]
    B --> C[Database<br/>receipt_cancellations]
    B --> D[Stripe API<br/>Refund]
    B --> E[Email Service<br/>Brevo]
    B --> F[File Storage<br/>Declarations]
    B --> G[Audit Log<br/>financial_audit_logs]

    C --> H[Status Tracking]
    D --> I[Refund Processing]
    E --> J[Notifications]
    F --> K[Document Management]
    G --> L[Compliance]
```
