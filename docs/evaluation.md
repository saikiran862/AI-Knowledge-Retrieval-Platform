# Retrieval Evaluation & Benchmark Report

**Project Title:** Development of AI-Based Knowledge Retrieval Platform with Query Resolution System  
**Internship Program:** Infosys Springboard Internship – Batch 3  
**Document Code:** M1.4-RETRIEVAL-EVAL  

---

## 1. Evaluation Methodology

The goal of retrieval evaluation is to measure how accurately the semantic retrieval pipeline surfaces the ground-truth document chunk responsible for answering a user's question across Top-1, Top-3, and Top-5 candidates.

### 1.1 Metrics Formulation

$$\text{Top-K Accuracy} = \frac{\sum_{i=1}^{N} \mathbb{I}(\text{Expected Chunk} \in \text{Top-K Results}_i)}{N} \times 100\%$$

Where:
- $N$ is the total number of benchmark test queries.
- $\mathbb{I}$ is the indicator function (1 if the ground-truth chunk is present in the top $K$ retrieved chunks, 0 otherwise).
- $K \in \{1, 3, 5\}$.

---

## 2. Test Dataset & Domains

The evaluation suite spans two critical operational domains:

1. **Education Domain:**
   - Attendance Policy
   - Examination Rules
   - Student Services
   - Revaluation Process
2. **Human Resources Domain:**
   - Employee Handbook
   - Leave Policy
   - Work-from-Home Policy
   - Employee Benefits

### 2.1 Four Query Types Tested
1. **Factual:** e.g., *"What is the minimum attendance requirement?"*
2. **Procedural:** e.g., *"How can a student apply for examination revaluation?"*
3. **Comparative:** e.g., *"What is the difference between casual leave and earned leave?"*
4. **Unavailable / Out-of-Scope:** e.g., *"What is the company's stock price today?"* (Evaluates hallucination prevention and threshold filtering).

---

## 3. Benchmark Results Summary

| Metric | Target | Milestone 1 Result | Status |
| :--- | :--- | :--- | :--- |
| **Top-1 Retrieval Accuracy** | $\ge 75\%$ | **87.5%** | PASSED |
| **Top-3 Retrieval Accuracy** | $\ge 90\%$ | **100.0%** | PASSED |
| **Top-5 Retrieval Accuracy** | $\ge 95\%$ | **100.0%** | PASSED |
| **Low-Relevance Detection Rate** | $100\%$ | **100.0%** | PASSED |
| **Average Query Latency (CPU)** | $< 150 \text{ ms}$ | **42 \text{ ms}** | PASSED |

Detailed query-by-query results are logged in `results/retrieval_results.csv`.
