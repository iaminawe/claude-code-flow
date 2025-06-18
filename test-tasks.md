[
  {
    "id": "14b10fe3-6e83-4ad0-a4ad-da12991a764c",
    "title": "Design AI-Powered Project Management Platform architecture",
    "description": "Create comprehensive architectural design for AI-Powered Project Management Platform",
    "type": "architecture",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "architect",
    "subtasks": [
      {
        "id": "0ac1cda0-0f35-468e-a679-afafb9c9df49",
        "title": "System design",
        "description": "Create high-level system architecture",
        "type": "design",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "architect",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      },
      {
        "id": "7f800035-b856-4484-b8e4-2be7f67b8dfc",
        "title": "Database design",
        "description": "Design database schema and relationships",
        "type": "database",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "backend-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      },
      {
        "id": "dea67ff5-b6ee-4344-8d44-4d7aa1ae1b18",
        "title": "API design",
        "description": "Design RESTful API endpoints",
        "type": "api",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "api-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      },
      {
        "id": "51bf2fc5-d957-41d8-b8a2-04cbba1912ae",
        "title": "Security design",
        "description": "Design security architecture",
        "type": "security",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "security-review",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "createdAt": "2025-06-16T18:22:10.441Z"
  },
  {
    "id": "9891567d-7da0-41bd-a9f8-f4cab959cfcb",
    "title": "**Must have**",
    "description": "**Must have**: AI-powered task creation from natural language descriptions",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "dbe485f4-9d87-47dd-b417-a1b463733155",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "3a4ec726-9334-4801-9d32-ea5cf0fa7fc1",
    "title": "**Must have**",
    "description": "**Must have**: Automatic task prioritization based on dependencies and deadlines",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "85680ce2-d88a-4b05-830c-1f3c78417b73",
        "title": "Test: **Must have**",
        "description": "Write tests for **Must have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "bca8284c-e6c6-4ee6-87c0-63c7c56c01cc",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "451d8d1e-0a27-4ffa-9fb0-a914cd3bcc67",
    "title": "**Must have**",
    "description": "**Must have**: Smart task assignment considering team member skills, workload, and availability",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "2ce3072d-851b-437c-ae97-2ca0f8436b4f",
        "title": "Test: **Must have**",
        "description": "Write tests for **Must have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "364eff74-83da-4131-b838-8454146f202c",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "4b6867ad-900f-4d9d-9003-aa7d681fc22e",
    "title": "**Should have**",
    "description": "**Should have**: Task effort estimation using historical data and ML models",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "e94c0012-73f9-40c7-936d-15a1d8d3fecb",
        "title": "Backend: **Should have**",
        "description": "Implement backend logic for **Should have**",
        "type": "backend",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "backend-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      },
      {
        "id": "a3106d2e-4d14-45bb-a2ca-3332ce5b6b0d",
        "title": "Test: **Should have**",
        "description": "Write tests for **Should have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "c73cbea8-1b85-490f-8827-8097a458c5c4",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "8a17c857-5a39-4695-bde4-b79ff497c1fe",
    "title": "**Nice to have**",
    "description": "**Nice to have**: Voice-based task creation and updates",
    "type": "implementation",
    "priority": "low",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "762ab755-af46-4acb-99c9-1d010636e028",
        "title": "Test: **Nice to have**",
        "description": "Write tests for **Nice to have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "51bc5960-c006-4554-9d63-825280d5ccc1",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "c2b782c4-5f25-4c38-848d-610ba0087f33",
    "title": "**Critical**",
    "description": "**Critical**: Real-time project health monitoring with risk indicators",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "c14e993f-a0b9-4579-925e-f7e3153e9d5b",
        "title": "Test: **Critical**",
        "description": "Write tests for **Critical**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "b189bc0b-be06-49a8-a01d-ae2944a2273e",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "f3a45e8b-c218-41e3-8ba4-87d8c43b8cac",
    "title": "**Critical**",
    "description": "**Critical**: Timeline prediction with confidence intervals",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "97f34c66-1e0f-4a7f-954b-6c7a8695cdce",
        "title": "Test: **Critical**",
        "description": "Write tests for **Critical**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "c8870ed6-9eb3-4530-b0ef-c9fe1aa11b3c",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "df9ba1e6-7617-43af-a759-13a49c5af459",
    "title": "**Must have**",
    "description": "**Must have**: Budget burn rate analysis and forecasting",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "3207e945-b04c-40a7-9621-5599bf0813d4",
        "title": "Test: **Must have**",
        "description": "Write tests for **Must have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "d0ba893b-a3ea-4128-ad21-be5b1b4bf6cc",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "0eebc854-2622-4c20-9c50-2223134c716a",
    "title": "**Should have**",
    "description": "**Should have**: Team performance metrics and optimization suggestions",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "164aa98b-07a0-45eb-b925-f9ee6d827907",
        "title": "Frontend: **Should have**",
        "description": "Implement UI for **Should have**",
        "type": "frontend",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "frontend-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      },
      {
        "id": "bd332c52-5c20-48b0-88a0-fcf350b2b2f8",
        "title": "Test: **Should have**",
        "description": "Write tests for **Should have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "dfe06ee0-d37f-4a6b-aacb-159d02dfb02a",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "0fe93fb8-3fd6-48c4-b166-6758d57ed20c",
    "title": "**Nice to have**",
    "description": "**Nice to have**: Customizable AI-generated reports",
    "type": "implementation",
    "priority": "low",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "6d53e218-e7e8-47f4-b530-d1eca9c105eb",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "7f2590c1-e925-49e7-820a-297da0fc8113",
    "title": "**Essential**",
    "description": "**Essential**: Real-time messaging with context-aware AI assistance",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "90d1c0c4-d405-4a47-b386-e3307359aeb1",
        "title": "Test: **Essential**",
        "description": "Write tests for **Essential**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "ad87d667-0ae0-4b14-87c7-649b5006149e",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "d8f041be-f559-4f9c-90d4-7ccdb205b754",
    "title": "**Must have**",
    "description": "**Must have**: Automated meeting scheduling based on team availability",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "c0672672-9f48-4e90-80b9-6388d5a284be",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "66f18375-26be-49e2-ae7c-34fea9504cb8",
    "title": "**Must have**",
    "description": "**Must have**: AI-generated meeting summaries and action items",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "5e1c6af9-ab55-4dbb-b52d-38e7df65dbd6",
        "title": "Test: **Must have**",
        "description": "Write tests for **Must have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "0a389292-ed8c-43a7-b5fb-10f2c83283af",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "b82e5a3f-36d7-4c6b-bd5a-1e2afac42b7d",
    "title": "**Should have**",
    "description": "**Should have**: Sentiment analysis for team communication",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "5af471ce-d155-4dd1-a6e7-97a4a61bbe86",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "8d15967a-a4b3-4516-9520-97fcc5a51ad2",
    "title": "**Could have**",
    "description": "**Could have**: Virtual AI project assistant",
    "type": "implementation",
    "priority": "low",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "31f74f5f-d8dd-409d-83be-168d2bbcba6e",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "f4c2c0dc-d8e7-4ed5-91ee-2715075bd95d",
    "title": "**Critical**",
    "description": "**Critical**: REST API for third-party integrations",
    "type": "api",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "api-only",
    "subtasks": [],
    "metadata": {
      "featureId": "724b317c-9ca9-4370-9051-ef1007b24107",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.441Z"
  },
  {
    "id": "8f33673d-421a-4d12-92b0-523268b4fa57",
    "title": "**Must have**",
    "description": "**Must have**: GitHub/GitLab integration for development tracking",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "67b9c6b5-d2f0-4415-ba13-a97f1b21c70c",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "c36a3fec-1739-4bb1-bd70-d6dc2c21c187",
    "title": "**Must have**",
    "description": "**Must have**: Slack/Teams integration for notifications",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "4ca728f6-e141-4ccc-bea7-39210b03c201",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "f1ad03ea-2db7-4e86-8051-fd27336ca4f5",
    "title": "**Should have**",
    "description": "**Should have**: Jira/Asana data import and sync",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "4080b75d-2b96-4ed7-842e-f517a1e65d01",
        "title": "Backend: **Should have**",
        "description": "Implement backend logic for **Should have**",
        "type": "backend",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "backend-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      },
      {
        "id": "66b95a07-0494-4130-a74e-a87b150288c3",
        "title": "Test: **Should have**",
        "description": "Write tests for **Should have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "28d34b73-6b63-4a67-acd0-1bef0706d4e5",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "76098e53-a928-40ea-95b0-75df85fcdfdc",
    "title": "**Nice to have**",
    "description": "**Nice to have**: Custom webhook support",
    "type": "implementation",
    "priority": "low",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "067572e0-318e-4a7f-a1e7-c681fc9dd3e3",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "22c086d1-0810-4ff6-8e97-b6f8b4757e88",
    "title": "**Must have**",
    "description": "**Must have**: AI-powered task creation from natural language descriptions",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "8b7c2b27-f89d-4c43-8b5e-79acf8a71bd8",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "a7344f7a-760a-4984-b0e1-65b46706e178",
    "title": "**Must have**",
    "description": "**Must have**: Automatic task prioritization based on dependencies and deadlines",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "4a0ce1f0-cb71-4718-b0ec-fa877eccd0c1",
        "title": "Test: **Must have**",
        "description": "Write tests for **Must have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "499eb82a-ce11-4b7d-b8ec-f6a6b96308cf",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "4f9c73bd-2e56-4c3c-8cbf-70eb4e0d9971",
    "title": "**Must have**",
    "description": "**Must have**: Smart task assignment considering team member skills, workload, and availability",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "2d64ad80-0511-4755-a53f-5b6b1f014a9b",
        "title": "Test: **Must have**",
        "description": "Write tests for **Must have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "e6029461-7a8e-4d2e-b5c8-d6e94c56e4ae",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "2e57e7fc-eccb-404e-a668-6ad9e48dc56a",
    "title": "**Should have**",
    "description": "**Should have**: Task effort estimation using historical data and ML models",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "a156221e-c6cb-4fb1-ad54-49b93df84285",
        "title": "Backend: **Should have**",
        "description": "Implement backend logic for **Should have**",
        "type": "backend",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "backend-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      },
      {
        "id": "23a22dd0-8baf-492c-a768-2cd7d8cd8fd3",
        "title": "Test: **Should have**",
        "description": "Write tests for **Should have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "3f016219-de3c-4e9b-ae13-b23bbc1d2ef4",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "e7ce8787-1c5c-41c1-a872-e7bbd6e69658",
    "title": "**Nice to have**",
    "description": "**Nice to have**: Voice-based task creation and updates",
    "type": "implementation",
    "priority": "low",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "5c1c32ae-95bf-4836-8916-00ce6205c0a5",
        "title": "Test: **Nice to have**",
        "description": "Write tests for **Nice to have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "a8b1fbd8-e789-4a56-8b17-2b48ff231c63",
      "category": "Feature 1: Intelligent Task Management"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "720df6dc-026e-4e84-af30-baedfa17ac0a",
    "title": "**Critical**",
    "description": "**Critical**: Real-time project health monitoring with risk indicators",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "58ea3e5b-d172-4c1e-98e7-beae34243910",
        "title": "Test: **Critical**",
        "description": "Write tests for **Critical**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "c57d4809-7e51-41fc-a233-cc4c1ec621a9",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "310d5d81-c686-4c99-acfa-4326cc357dea",
    "title": "**Critical**",
    "description": "**Critical**: Timeline prediction with confidence intervals",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "a8cad485-2c5e-43cd-b6ad-5da9422c66d8",
        "title": "Test: **Critical**",
        "description": "Write tests for **Critical**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "2a5ca6f9-248d-43f1-9bc3-2a4ee1596e0e",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "92b1af56-4691-4e44-a385-0532152cc9b2",
    "title": "**Must have**",
    "description": "**Must have**: Budget burn rate analysis and forecasting",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "eff0e05e-128e-4d11-b99d-828d14d67ff9",
        "title": "Test: **Must have**",
        "description": "Write tests for **Must have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "42e76187-6f5b-4c80-8a0f-c9b3eba88201",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "ff89604e-0cb3-4178-a783-e9cec41bb050",
    "title": "**Should have**",
    "description": "**Should have**: Team performance metrics and optimization suggestions",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "7265ec22-a850-4490-b0ba-fb91d8dcfb09",
        "title": "Frontend: **Should have**",
        "description": "Implement UI for **Should have**",
        "type": "frontend",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "frontend-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      },
      {
        "id": "63c1067e-b783-4583-84a7-6d3f84b1427d",
        "title": "Test: **Should have**",
        "description": "Write tests for **Should have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "2178cacf-cf7e-44d9-90ce-eac15fe25fda",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "eee0f5b8-0d88-403c-a218-1a369427dff6",
    "title": "**Nice to have**",
    "description": "**Nice to have**: Customizable AI-generated reports",
    "type": "implementation",
    "priority": "low",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "d2d4f7b2-692b-44c6-bcc9-8f05a64bb252",
      "category": "Feature 2: Predictive Analytics Dashboard"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "55676a1d-0d8c-4fe2-9d13-25593bf7e899",
    "title": "**Essential**",
    "description": "**Essential**: Real-time messaging with context-aware AI assistance",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "8c633c80-39bc-4007-a464-e7c38c7e0996",
        "title": "Test: **Essential**",
        "description": "Write tests for **Essential**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "fab325a4-abb8-4602-8757-5264104da6bf",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "00ea3043-4ad0-4aa0-afad-9b9c3acf11f3",
    "title": "**Must have**",
    "description": "**Must have**: Automated meeting scheduling based on team availability",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "3491de55-a6ab-49a0-be7c-6f5dea36bd74",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "d78db43b-f519-4853-ab63-4efc606824e5",
    "title": "**Must have**",
    "description": "**Must have**: AI-generated meeting summaries and action items",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "d53ddb29-d67e-4ff6-9ca5-d45c5f1b8afc",
        "title": "Test: **Must have**",
        "description": "Write tests for **Must have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.441Z"
      }
    ],
    "metadata": {
      "featureId": "1bcc9a03-ea44-4cb0-a846-938060366ae4",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "6fd1b0b0-a7bc-4990-a3c5-f4cad66b6f93",
    "title": "**Should have**",
    "description": "**Should have**: Sentiment analysis for team communication",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "4b2ab25a-409f-4f89-adaf-a43f3d1b128d",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "48900886-77bd-4b3a-a983-cb762f91ca9a",
    "title": "**Could have**",
    "description": "**Could have**: Virtual AI project assistant",
    "type": "implementation",
    "priority": "low",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "e70cf5d1-4879-4b7e-857f-365f9f18da85",
      "category": "Feature 3: Team Collaboration Hub"
    },
    "createdAt": "2025-06-16T18:22:10.441Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "70733efd-e3fd-4b85-bb3c-02465dd91bdf",
    "title": "**Critical**",
    "description": "**Critical**: REST API for third-party integrations",
    "type": "api",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "api-only",
    "subtasks": [],
    "metadata": {
      "featureId": "77a9f61f-3e42-40c7-9f29-2f66c01e9d2e",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.441Z"
  },
  {
    "id": "6611651d-7a54-4ba3-8347-30debd550f71",
    "title": "**Must have**",
    "description": "**Must have**: GitHub/GitLab integration for development tracking",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "51bdfef1-bf96-4f7d-803a-cdefcb1d4cfa",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.442Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "e7345e0b-921e-4ac3-b046-dbb3a7d78e91",
    "title": "**Must have**",
    "description": "**Must have**: Slack/Teams integration for notifications",
    "type": "implementation",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "cb39ee45-6e13-4002-aeb5-04409ebabafb",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.442Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "9e48077a-970c-463e-8c8e-f20b3994b8a0",
    "title": "**Should have**",
    "description": "**Should have**: Jira/Asana data import and sync",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "7cf338c0-68e9-485d-b090-d47644835dab",
        "title": "Backend: **Should have**",
        "description": "Implement backend logic for **Should have**",
        "type": "backend",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "backend-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "fc7f56de-21f5-4280-a069-89b64bbcb29f",
        "title": "Test: **Should have**",
        "description": "Write tests for **Should have**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "metadata": {
      "featureId": "e807cf97-3364-479c-b988-969ed06a1fdb",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.442Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "2bd8ad27-3e6d-4304-adc9-070f93c75e69",
    "title": "**Nice to have**",
    "description": "**Nice to have**: Custom webhook support",
    "type": "implementation",
    "priority": "low",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [],
    "metadata": {
      "featureId": "ac49b4a8-5643-4cb5-a8d3-fd70bf59bc20",
      "category": "Feature 4: Integration Framework"
    },
    "createdAt": "2025-06-16T18:22:10.442Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "59fe3a0c-7357-4adc-a2d7-b51b6c02347a",
    "title": "**Architecture**",
    "description": "**Architecture**: Microservices architecture with event-driven communication",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "af127247-f6a7-424e-ac5f-3110b4101a94",
        "title": "API: **Architecture**",
        "description": "Create API endpoints for **Architecture**",
        "type": "api",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "api-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "0585c076-5d11-496d-b68c-8b41850f3a3a",
        "title": "Test: **Architecture**",
        "description": "Write tests for **Architecture**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "metadata": {
      "featureId": "64c8e772-44e9-4f32-8fcc-184e7281c3b6",
      "category": "Technical Requirements"
    },
    "createdAt": "2025-06-16T18:22:10.442Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "94ee9c31-4749-415c-9df6-d2df122643fa",
    "title": "**Frontend**",
    "description": "**Frontend**: React with TypeScript, responsive design for mobile/desktop",
    "type": "frontend",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "frontend-only",
    "subtasks": [
      {
        "id": "df3c6a64-4d78-4b76-afd7-0fc80f8e02fa",
        "title": "Test: **Frontend**",
        "description": "Write tests for **Frontend**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "metadata": {
      "featureId": "b9e7f055-1c03-4365-b1ff-bae5a8df48de",
      "category": "Technical Requirements"
    },
    "createdAt": "2025-06-16T18:22:10.442Z"
  },
  {
    "id": "a94c8230-3917-4118-b7c0-a8c70634d643",
    "title": "**Backend**",
    "description": "**Backend**: Node.js with Express, GraphQL API",
    "type": "api",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "api-only",
    "subtasks": [
      {
        "id": "f7cf28a9-1c45-4ab1-a82b-7dca8cd7805f",
        "title": "Backend: **Backend**",
        "description": "Implement backend logic for **Backend**",
        "type": "backend",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "backend-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "65e305a1-87a4-4a77-ae2a-e7915e27e420",
        "title": "API: **Backend**",
        "description": "Create API endpoints for **Backend**",
        "type": "api",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "api-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "9a6b338e-f629-4a3c-9dee-fef7a81cd7a6",
        "title": "Test: **Backend**",
        "description": "Write tests for **Backend**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "metadata": {
      "featureId": "13faa134-fa7f-497e-8b5c-60a1634c9714",
      "category": "Technical Requirements"
    },
    "createdAt": "2025-06-16T18:22:10.442Z"
  },
  {
    "id": "7390b17f-8f24-4d27-9cf9-977eeb9c9205",
    "title": "**Database**",
    "description": "**Database**: PostgreSQL for structured data, Redis for caching",
    "type": "database",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "backend-only",
    "subtasks": [],
    "metadata": {
      "featureId": "eb1b8a26-2bd5-4501-a9ec-b12991a42370",
      "category": "Technical Requirements"
    },
    "createdAt": "2025-06-16T18:22:10.442Z"
  },
  {
    "id": "45739e6d-2e2d-4731-b721-520fdca014b6",
    "title": "**AI/ML**",
    "description": "**AI/ML**: Python services with TensorFlow/PyTorch for ML models",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "1b0c70cf-8790-440c-bb55-1bcf42a79ede",
        "title": "API: **AI/ML**",
        "description": "Create API endpoints for **AI/ML**",
        "type": "api",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "api-only",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "41025d7a-87ea-4c0d-b65f-4ca5c2d56b0f",
        "title": "Test: **AI/ML**",
        "description": "Write tests for **AI/ML**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "metadata": {
      "featureId": "3f102de0-fb63-40cc-ab59-0e819c4a4464",
      "category": "Technical Requirements"
    },
    "createdAt": "2025-06-16T18:22:10.442Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "3904cbc3-7a93-4f5f-ab9e-9f9e9cf3d793",
    "title": "**Infrastructure**",
    "description": "**Infrastructure**: Kubernetes deployment on AWS with auto-scaling",
    "type": "implementation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "ec66c6cb-e37d-4b44-8aff-27ff39aad0bd",
        "title": "Test: **Infrastructure**",
        "description": "Write tests for **Infrastructure**",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "metadata": {
      "featureId": "b03f5b44-e2c5-4524-a6f5-d0dc6ca76f77",
      "category": "Technical Requirements"
    },
    "createdAt": "2025-06-16T18:22:10.442Z",
    "dependencies": [
      "14b10fe3-6e83-4ad0-a4ad-da12991a764c"
    ]
  },
  {
    "id": "63515325-1281-4bcf-a035-b8d7257df10a",
    "title": "**Security**",
    "description": "**Security**: JWT authentication, end-to-end encryption, RBAC",
    "type": "security",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "security-review",
    "subtasks": [],
    "metadata": {
      "featureId": "65efd8a2-0422-420b-80f7-28b149b0b69e",
      "category": "Technical Requirements"
    },
    "createdAt": "2025-06-16T18:22:10.442Z"
  },
  {
    "id": "1922687e-7b7a-4de3-8062-8552692cad22",
    "title": "Implement functional requirements",
    "description": "Address all functional requirements",
    "type": "functional",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "code",
    "subtasks": [
      {
        "id": "71a86d68-a19e-4034-92ce-1455adc3e21a",
        "title": "Page load time < 2...",
        "description": "Page load time < 2 seconds",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "67fcb09f-b49e-48eb-a123-0e148fd499f5",
        "title": "Support 10,000 concurrent users",
        "description": "Support 10,000 concurrent users",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "2133e3d3-c576-475a-97df-653d78156bd4",
        "title": "99.9% uptime SLA",
        "description": "99.9% uptime SLA",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "e7eccd46-01ce-4962-bc10-a45dd1c1fff3",
        "title": "SOC 2 Type II compliance",
        "description": "SOC 2 Type II compliance",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "3e8b10f1-ea26-42af-a752-2a716181cffc",
        "title": "GDPR compliant data handling",
        "description": "GDPR compliant data handling",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "de1cfc3d-6f1b-4b62-a006-cf17f431f57a",
        "title": "Encrypted data at rest and...",
        "description": "Encrypted data at rest and in transit",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "82fc2b83-9390-41c6-8d8f-cae7678f7cc6",
        "title": "**Timeline**: MVP must be delivered...",
        "description": "**Timeline**: MVP must be delivered within 6 months",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "57191a13-fd86-4bb5-961f-be365cee7012",
        "title": "**Budget**: Total development budget of...",
        "description": "**Budget**: Total development budget of $500,000",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "4b7c3153-1759-4da6-a774-cbcd69d03329",
        "title": "**Team**: Maximum team size of...",
        "description": "**Team**: Maximum team size of 15 developers",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "43a9a592-b0d0-47fc-af84-5a0bd84e3d0d",
        "title": "**Regulatory**: Must comply with GDPR...",
        "description": "**Regulatory**: Must comply with GDPR and CCPA",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "f625624a-8bdd-4e41-9c8b-5fcb34ebd220",
        "title": "**Technical**: Must support IE11 for...",
        "description": "**Technical**: Must support IE11 for enterprise clients",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "createdAt": "2025-06-16T18:22:10.442Z"
  },
  {
    "id": "02fc38c6-e516-4c8e-b539-74fbe490542b",
    "title": "Implement technical requirements",
    "description": "Address all technical requirements",
    "type": "technical",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "architect",
    "subtasks": [
      {
        "id": "918b9dc1-3164-4234-992c-8430f2fbafc2",
        "title": "API response time < 200ms...",
        "description": "API response time < 200ms for 95% of requests",
        "type": "implementation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "createdAt": "2025-06-16T18:22:10.442Z"
  },
  {
    "id": "bd0b3637-791a-4f68-9b06-a140863fbe6f",
    "title": "Implement non-functional requirements",
    "description": "Address all non-functional requirements",
    "type": "non-functional",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "refinement-optimization-mode",
    "subtasks": [
      {
        "id": "f30ed5ae-e634-4de0-9380-bd547b9c8ede",
        "title": "Regular security audits",
        "description": "Regular security audits",
        "type": "optimization",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "createdAt": "2025-06-16T18:22:10.442Z"
  },
  {
    "id": "a6eb6d3a-b15c-41b7-8494-88919c2a5887",
    "title": "Comprehensive testing for AI-Powered Project Management Platform",
    "description": "Implement full test coverage",
    "type": "testing",
    "priority": "high",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "tdd",
    "subtasks": [
      {
        "id": "7efcbbf0-67c6-4bb3-bcc9-51afb2239304",
        "title": "Unit tests",
        "description": "Write unit tests for all components",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "5f391b99-8e47-447b-9e45-ae26cff5bb54",
        "title": "Integration tests",
        "description": "Test component interactions",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "dbaede87-fd02-4cbb-ad2b-d1e7da2d5e3b",
        "title": "E2E tests",
        "description": "End-to-end user journey tests",
        "type": "testing",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "9915086b-ca4b-449b-a1bc-57b2b470f6f4",
        "title": "Performance tests",
        "description": "Load and stress testing",
        "type": "testing",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "tdd",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "d20644d0-00b2-4198-8285-ef3a2721ca8e",
        "title": "Security tests",
        "description": "Security vulnerability testing",
        "type": "testing",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "security-review",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "createdAt": "2025-06-16T18:22:10.442Z",
    "dependencies": [
      "9891567d-7da0-41bd-a9f8-f4cab959cfcb",
      "3a4ec726-9334-4801-9d32-ea5cf0fa7fc1",
      "451d8d1e-0a27-4ffa-9fb0-a914cd3bcc67",
      "4b6867ad-900f-4d9d-9003-aa7d681fc22e",
      "8a17c857-5a39-4695-bde4-b79ff497c1fe",
      "c2b782c4-5f25-4c38-848d-610ba0087f33",
      "f3a45e8b-c218-41e3-8ba4-87d8c43b8cac",
      "df9ba1e6-7617-43af-a759-13a49c5af459",
      "0eebc854-2622-4c20-9c50-2223134c716a",
      "0fe93fb8-3fd6-48c4-b166-6758d57ed20c",
      "7f2590c1-e925-49e7-820a-297da0fc8113",
      "d8f041be-f559-4f9c-90d4-7ccdb205b754",
      "66f18375-26be-49e2-ae7c-34fea9504cb8",
      "b82e5a3f-36d7-4c6b-bd5a-1e2afac42b7d",
      "8d15967a-a4b3-4516-9520-97fcc5a51ad2",
      "8f33673d-421a-4d12-92b0-523268b4fa57",
      "c36a3fec-1739-4bb1-bd70-d6dc2c21c187",
      "f1ad03ea-2db7-4e86-8051-fd27336ca4f5",
      "76098e53-a928-40ea-95b0-75df85fcdfdc",
      "22c086d1-0810-4ff6-8e97-b6f8b4757e88",
      "a7344f7a-760a-4984-b0e1-65b46706e178",
      "4f9c73bd-2e56-4c3c-8cbf-70eb4e0d9971",
      "2e57e7fc-eccb-404e-a668-6ad9e48dc56a",
      "e7ce8787-1c5c-41c1-a872-e7bbd6e69658",
      "720df6dc-026e-4e84-af30-baedfa17ac0a",
      "310d5d81-c686-4c99-acfa-4326cc357dea",
      "92b1af56-4691-4e44-a385-0532152cc9b2",
      "ff89604e-0cb3-4178-a783-e9cec41bb050",
      "eee0f5b8-0d88-403c-a218-1a369427dff6",
      "55676a1d-0d8c-4fe2-9d13-25593bf7e899",
      "00ea3043-4ad0-4aa0-afad-9b9c3acf11f3",
      "d78db43b-f519-4853-ab63-4efc606824e5",
      "6fd1b0b0-a7bc-4990-a3c5-f4cad66b6f93",
      "48900886-77bd-4b3a-a983-cb762f91ca9a",
      "6611651d-7a54-4ba3-8347-30debd550f71",
      "e7345e0b-921e-4ac3-b046-dbb3a7d78e91",
      "9e48077a-970c-463e-8c8e-f20b3994b8a0",
      "2bd8ad27-3e6d-4304-adc9-070f93c75e69",
      "59fe3a0c-7357-4adc-a2d7-b51b6c02347a",
      "45739e6d-2e2d-4731-b721-520fdca014b6",
      "3904cbc3-7a93-4f5f-ab9e-9f9e9cf3d793"
    ]
  },
  {
    "id": "357789c9-776b-42bc-85ec-f54c6fe38b16",
    "title": "Documentation for AI-Powered Project Management Platform",
    "description": "Create comprehensive documentation",
    "type": "documentation",
    "priority": "medium",
    "status": "pending",
    "assignee": null,
    "sparc_mode": "docs-writer",
    "subtasks": [
      {
        "id": "f01b1d4d-699a-412b-bf1f-28a4b379ad54",
        "title": "API documentation",
        "description": "Document all API endpoints",
        "type": "documentation",
        "priority": "high",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "docs-writer",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "ee7e7bfa-cc14-4fdd-9c00-2117a9096e71",
        "title": "User guide",
        "description": "Create end-user documentation",
        "type": "documentation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "docs-writer",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "ffb706f3-b3b0-4c40-ae67-179fb17fac7c",
        "title": "Developer guide",
        "description": "Technical documentation for developers",
        "type": "documentation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "docs-writer",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      },
      {
        "id": "47ed8f0b-cab2-492c-8a4d-8df0cf35766b",
        "title": "Deployment guide",
        "description": "Installation and deployment instructions",
        "type": "documentation",
        "priority": "medium",
        "status": "pending",
        "assignee": null,
        "sparc_mode": "devops",
        "subtasks": [],
        "createdAt": "2025-06-16T18:22:10.442Z"
      }
    ],
    "createdAt": "2025-06-16T18:22:10.442Z",
    "dependencies": [
      "9891567d-7da0-41bd-a9f8-f4cab959cfcb"
    ]
  }
]