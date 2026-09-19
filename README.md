# production_line_optimisation
# 🏭 Multi-Agent Manufacturing Intelligence System

### AI-powered decision-support system for manufacturing quality, efficiency, predictive maintenance and profitability.

---

## 📌 Overview

Manufacturing problems rarely occur in isolation. A defect may be caused by process drift, machine degradation, environmental conditions or raw-material variation, while simultaneously creating bottlenecks, increasing scrap and reducing profitability.

Our solution is a **software-only Multi-Agent Manufacturing Intelligence System** that uses **specialized analytical AI/ML models for different stages of manufacturing**.

Instead of using one general-purpose AI model for everything, each stage has a dedicated model designed for its specific task. A central AI orchestrator combines their outputs and provides **evidence-based recommendations and simulations**.

The system is **advisory only** and does not directly control machines, PLCs, robots or production equipment.

---

# 🎯 Problem

High-throughput manufacturing environments face:

* Subtle or unknown product defects
* Production bottlenecks
* Process and batch-to-batch drift
* Machine degradation
* Environmental variations
* Excess scrap and rework
* Difficulty tracing customer complaints
* High downtime and maintenance costs
* Poor visibility into profitability
* Difficulty evaluating possible interventions

The challenge is to connect **quality + production + machine health + environment + economics** into one intelligent decision-support system.

---

# 💡 Our Solution

Our system follows:

> **Detect → Diagnose → Trace → Quantify → Search → Simulate → Recommend → Learn**

```text
                    USER
                     │
                     ▼
             AI ORCHESTRATOR
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
   QUALITY       PRODUCTION      MACHINE
    MODEL           MODEL         HEALTH
      │              │              │
      └──────────────┼──────────────┘
                     ▼
              PROCESS / ROOT
              CAUSE ANALYSIS
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
  ENVIRONMENT    ECONOMICS     SIMULATION
     MODEL          MODEL         ENGINE
       │             │             │
       └─────────────┼─────────────┘
                     ▼
              KNOWLEDGE AGENT
          (Historical + Web Search)
                     │
                     ▼
           RECOMMENDATION ENGINE
                     │
                     ▼
              HUMAN DECISION
```

---

# 🚀 Key Features

### 1. 🔍 Intelligent Defect Detection

* Classifies products as acceptable/defective.
* Localizes defects where data supports it.
* Flags **unknown/novel defects** instead of forcing incorrect classifications.
* Designed to be robust against background, lighting and other irrelevant visual variations.

---

### 2. 🏭 Production Bottleneck Detection

Analyzes:

* Cycle time
* Throughput
* WIP
* Utilization
* Downtime
* Station capacity
* Changeovers

Identifies where production is becoming inefficient and estimates its impact.

---

### 3. ⚙️ Predictive Machine Health

Analyzes machine parameters such as:

* Vibration
* Temperature
* Cycle time
* Operating history

to identify potential machine degradation and provide early maintenance alerts.

---

### 4. 🌡️ Environmental Monitoring

Monitors available environmental conditions such as:

* Temperature
* Humidity
* Pressure
* Lighting

and identifies abnormal conditions that may affect individual products or production batches.

---

### 5. 📦 Batch-Level Quality & Traceability

Every product is linked to its:

```text
Product → Batch → Station → Process Conditions → Inspection
```

This allows customer complaints to be traced back to potentially affected batches and production conditions.

---

### 6. 💰 Profitability Analysis

Estimates the financial effect of:

* Defects
* Scrap
* Rework
* Downtime
* Reduced throughput
* Process changes

The system can estimate how profitability may change under different production scenarios.

---

### 7. 🧪 Production Simulation

A virtual representation of the production line allows users to test:

* Capacity changes
* Cycle-time changes
* Machine downtime
* Staffing changes
* Production scheduling
* Bottleneck interventions

The AI can also **suggest useful scenarios to simulate** based on detected problems.

---

### 8. 🌐 External Solution Search

When a problem is detected, the Knowledge Agent can search relevant technical sources for similar documented problems and solutions.

Results include:

* Source
* Similarity
* Proposed solution
* Supporting evidence
* Estimated applicability

External information is treated as evidence, not as an automatic instruction.

---

### 9. 🗄️ Manufacturing Knowledge Base

Previously encountered problems and their outcomes are stored:

```text
Problem
   ↓
Root Cause
   ↓
Solution
   ↓
Cost
   ↓
Time
   ↓
Risk
   ↓
Actual Outcome
```

Future incidents can be compared with historical cases.

---

### 10. ⏱️ Time + Safety Based Recommendations

Recommendations are evaluated using two primary dimensions:

**Minimum Resolution Time**

> How quickly could the problem potentially be addressed?

**Safety / Risk**

> How conservative is the proposed intervention?

The system presents multiple options rather than automatically selecting an action.

---

### 11. 💵 Cost-Aware Solutions

Solutions can be compared using:

* Equipment cost
* Labor cost
* Downtime cost
* Maintenance cost
* Scrap/rework cost

The system can identify the **lowest-cost simulated intervention that meets a selected target**.

---

### 12. 🌍 Multilingual Interface

The system provides different levels of information for:

**Workers**

> Simple warnings and instructions.

**Engineers**

> Technical analysis and model evidence.

**Management**

> Cost, production and profitability impact.

The interface can support multiple languages without changing the underlying analytical models.

---

### 13. 📸 Delivery Damage Detection

Product images captured before and after delivery can be compared to identify potential:

* Scratches
* Cracks
* Dents
* Deformation
* Missing components

This helps determine whether damage may have occurred during transportation.

---

### 14. 🔄 Continuous Learning

Engineer decisions and observed outcomes are stored for future analysis.

Reinforcement learning can eventually be used within the **simulation environment** to improve decision policies without experimenting directly on physical production equipment.

---

# 🧠 Specialized AI Models

| Manufacturing Function | Model / Technique                             |
| ---------------------- | --------------------------------------------- |
| Defect Detection       | YOLO / CNN / Vision Transformer               |
| Novel Defects          | Autoencoder / Isolation Forest                |
| Process Drift          | Statistical Analysis / Change-Point Detection |
| Bottleneck Detection   | Production Analytics / Optimization           |
| Machine Health         | Time-Series ML / Anomaly Detection            |
| Environment            | Anomaly Detection / Time-Series ML            |
| Root Cause             | XGBoost + SHAP                                |
| Profitability          | Regression + Optimization                     |
| Production Simulation  | SimPy / OR-Tools                              |
| External Knowledge     | RAG + Search                                  |
| Delivery Damage        | Computer Vision                               |
| Recommendations        | Rules + Optimization + LLM                    |
| Continuous Learning    | Reinforcement Learning                        |

---

# 🛡️ Hallucination Prevention

A key design principle is:

> **The LLM explains verified results; it does not invent them.**

```text
User Query
    ↓
AI Orchestrator
    ↓
Specialized Analytical Models
    ↓
Verified Data
    ↓
Simulation / Database / Evidence
    ↓
LLM Explanation
    ↓
Human Decision
```

Critical values such as:

* Defect rates
* Production metrics
* Costs
* Profitability
* Machine-health scores

are obtained from analytical models or databases rather than generated by the LLM.

---

# 🛠️ Technology Stack

### AI / ML

* Python
* PyTorch
* Scikit-learn
* XGBoost
* YOLO

### Data

* Pandas
* NumPy
* PostgreSQL

### Simulation & Optimization

* SimPy
* OR-Tools

### Computer Vision

* OpenCV
* Pillow

### Generative AI

* LLM
* RAG
* Embeddings

### Backend

* FastAPI

### Frontend

* Streamlit

### Visualization

* Plotly

---

# 📁 Project Structure

```text
manufacturing-ai/
│
├── agents/
│   ├── quality/
│   ├── production/
│   ├── machine_health/
│   ├── environment/
│   ├── economics/
│   ├── simulation/
│   ├── knowledge/
│   └── recommendation/
│
├── models/
│   ├── quality/
│   ├── anomaly/
│   ├── maintenance/
│   └── profitability/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── database/
├── simulation/
├── api/
├── dashboard/
├── training/
│
├── requirements.txt
├── .env.example
└── README.md
```

---

# ⚙️ Setup

### 1. Clone

```bash
git clone https://github.com/<username>/manufacturing-ai.git
cd manufacturing-ai
```

### 2. Create environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create `.env`:

```env
DATABASE_URL=your_database_url
LLM_API_KEY=your_api_key
SEARCH_API_KEY=your_search_api_key
```

### 5. Run backend

```bash
uvicorn api.main:app --reload
```

### 6. Run dashboard

```bash
streamlit run dashboard/app.py
```

---

# 🔄 Example End-to-End Workflow

Suppose the system detects an increase in defects.

```text
Defect Rate ↑
     ↓
Quality Model
     ↓
Affected Batch Identified
     ↓
Process Model detects temperature drift
     ↓
Machine Model detects abnormal vibration
     ↓
Production Model identifies bottleneck
     ↓
Root Cause Analysis
     ↓
Economic Model calculates potential losses
     ↓
Knowledge Agent searches similar problems
     ↓
Simulation Agent tests possible interventions
     ↓
Cost + Time + Risk comparison
     ↓
Recommendation
     ↓
Engineer Decision
     ↓
Outcome stored in Knowledge Base
```

---

# 🔐 Safety & Scope

This project is **software-only**.

The system does not:

* Control PLCs
* Control machines
* Operate robots
* Change machine parameters automatically
* Perform physical interventions
* Automatically approve safety-critical decisions

All recommendations and interventions are:

> **Simulated, advisory and subject to human approval.**

---

# 🎯 Expected Impact

The system aims to help manufacturers:

* Reduce defects and scrap
* Identify production bottlenecks
* Detect machine degradation earlier
* Improve batch traceability
* Reduce downtime
* Evaluate production changes safely
* Estimate profitability
* Reuse historical solutions
* Identify potential logistics damage
* Support workers in multiple languages
* Make faster, evidence-based decisions

---

# 🏆 Core Value Proposition

### Traditional approach

```text
Detect Problem
      ↓
Human investigates
      ↓
Searches for solution
      ↓
Tests solution
      ↓
Analyzes result
```

### Our approach

```text
Detect
  ↓
Diagnose
  ↓
Trace
  ↓
Search
  ↓
Simulate
  ↓
Calculate Cost / Time / Risk
  ↓
Recommend
  ↓
Human Decision
  ↓
Learn
```

> **Our goal is not to replace manufacturing engineers. It is to give them an intelligent system that connects quality, production, machine health and economics to make faster and better-informed decisions.**
