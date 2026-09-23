"""
Retrieval Evaluation Subsystem
Evaluates Top-1, Top-3, and Top-5 retrieval accuracy across benchmark test queries.
Outputs results to results/retrieval_results.csv and produces detailed performance metrics.
"""

import csv
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config.settings import settings
from app.retrieval.search import retrieval_service
from app.retrieval.vector_store import vector_store

logger = logging.getLogger(__name__)

# Standard benchmark queries across Education and HR domains + Out of Scope
BENCHMARK_TEST_SUITE = [
    {
        "query": "What is the minimum attendance requirement?",
        "domain": "Education",
        "expected_keyword": "75%",
        "expected_doc": "attendance_policy.txt"
    },
    {
        "query": "How can a student apply for examination revaluation?",
        "domain": "Education",
        "expected_keyword": "portal.university.edu/exams",
        "expected_doc": "revaluation_process.txt"
    },
    {
        "query": "What are the consequences of copying in an exam?",
        "domain": "Education",
        "expected_keyword": "disciplinary action committee",
        "expected_doc": "examination_rules.txt"
    },
    {
        "query": "Where can students get career guidance on campus?",
        "domain": "Education",
        "expected_keyword": "career guidance and placement cell",
        "expected_doc": "student_services.txt"
    },
    {
        "query": "What is the difference between casual leave and earned leave?",
        "domain": "Human Resources",
        "expected_keyword": "casual leave (cl)",
        "expected_doc": "leave_policy.txt"
    },
    {
        "query": "What is the core working hours requirement in the handbook?",
        "domain": "Human Resources",
        "expected_keyword": "10:30 am and 4:00 pm",
        "expected_doc": "employee_handbook.txt"
    },
    {
        "query": "What is the broadband reimbursement allowance for remote work?",
        "domain": "Human Resources",
        "expected_keyword": "inr 1,500",
        "expected_doc": "work_from_home_policy.txt"
    },
    {
        "query": "What is the health insurance coverage limit for employees?",
        "domain": "Human Resources",
        "expected_keyword": "group medical insurance",
        "expected_doc": "employee_benefits.csv"
    },
    {
        "query": "What is the company's stock price today?",
        "domain": "Out of Scope",
        "expected_keyword": "NONE",
        "expected_doc": "NONE"
    },
    {
        "query": "Who won the 2026 cricket world cup?",
        "domain": "Out of Scope",
        "expected_keyword": "NONE",
        "expected_doc": "NONE"
    }
]


def run_evaluation(output_csv_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Executes benchmark queries against the current vector store index,
    computes Top-1, Top-3, and Top-5 accuracy, and writes to CSV.
    """
    csv_path = output_csv_path or (settings.RESULTS_DIR / "retrieval_results.csv")
    csv_path.parent.mkdir(parents=True, exist_ok=True)

    results_rows = []
    top1_correct = 0
    top3_correct = 0
    top5_correct = 0
    in_scope_count = 0
    out_of_scope_correct = 0
    out_of_scope_count = 0

    for test_case in BENCHMARK_TEST_SUITE:
        query = test_case["query"]
        domain = test_case["domain"]
        expected_keyword = test_case["expected_keyword"].lower()
        expected_doc = test_case["expected_doc"].lower()
        is_out_of_scope = (expected_keyword == "none")

        # Retrieve top 5 candidates with low threshold to inspect all scores
        retrieved_chunks = retrieval_service.retrieve(
            query_text=query,
            query_id=f"EVAL_{len(results_rows)+1:03d}",
            top_k=5,
            threshold=0.0
        )

        top1_hit = False
        top3_hit = False
        top5_hit = False
        top1_score = retrieved_chunks[0].score if len(retrieved_chunks) > 0 else 0.0
        top3_scores = [c.score for c in retrieved_chunks[:3]]
        top5_scores = [c.score for c in retrieved_chunks[:5]]

        top3_best = max(top3_scores) if top3_scores else 0.0
        top5_best = max(top5_scores) if top5_scores else 0.0

        if is_out_of_scope:
            out_of_scope_count += 1
            # For out-of-scope, passing means the best score is BELOW the similarity threshold
            if top1_score < settings.SIMILARITY_THRESHOLD:
                out_of_scope_correct += 1
                top1_hit = False
                top3_hit = False
                top5_hit = False
        else:
            in_scope_count += 1
            for idx, chunk in enumerate(retrieved_chunks):
                text_lower = chunk.text_snippet.lower()
                doc_lower = chunk.source_file.lower()
                # Check match criteria
                if (expected_keyword in text_lower) or (expected_doc in doc_lower):
                    if idx == 0:
                        top1_hit = True
                    if idx < 3:
                        top3_hit = True
                    if idx < 5:
                        top5_hit = True
                    break

            if top1_hit:
                top1_correct += 1
            if top3_hit:
                top3_correct += 1
            if top5_hit:
                top5_correct += 1

        results_rows.append({
            "query": query,
            "domain": domain,
            "expected_chunk": f"Match on '{expected_keyword}' ({expected_doc})",
            "top1_result": top1_hit if not is_out_of_scope else (top1_score >= settings.SIMILARITY_THRESHOLD),
            "top3_result": top3_hit if not is_out_of_scope else (top3_best >= settings.SIMILARITY_THRESHOLD),
            "top5_result": top5_hit if not is_out_of_scope else (top5_best >= settings.SIMILARITY_THRESHOLD),
            "top1_score": round(top1_score, 4),
            "top3_best_score": round(top3_best, 4),
            "top5_best_score": round(top5_best, 4),
        })

    # Write to CSV
    fieldnames = [
        "query", "domain", "expected_chunk", "top1_result", "top3_result",
        "top5_result", "top1_score", "top3_best_score", "top5_best_score"
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results_rows)

    top1_acc = (top1_correct / in_scope_count * 100) if in_scope_count else 0.0
    top3_acc = (top3_correct / in_scope_count * 100) if in_scope_count else 0.0
    top5_acc = (top5_correct / in_scope_count * 100) if in_scope_count else 0.0
    out_of_scope_acc = (out_of_scope_correct / out_of_scope_count * 100) if out_of_scope_count else 100.0

    summary = {
        "total_queries": len(BENCHMARK_TEST_SUITE),
        "in_scope_queries": in_scope_count,
        "out_of_scope_queries": out_of_scope_count,
        "top1_accuracy_pct": round(top1_acc, 2),
        "top3_accuracy_pct": round(top3_acc, 2),
        "top5_accuracy_pct": round(top5_acc, 2),
        "out_of_scope_rejection_pct": round(out_of_scope_acc, 2),
        "csv_path": str(csv_path),
        "detailed_results": results_rows
    }

    logger.info(f"Evaluation finished: Top-1={top1_acc}%, Top-3={top3_acc}%, Top-5={top5_acc}%")
    return summary


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Executing Benchmark Retrieval Evaluation...")
    summary = run_evaluation()
    print("\n--- BENCHMARK RESULTS ---")
    print(f"Top-1 Accuracy: {summary['top1_accuracy_pct']}%")
    print(f"Top-3 Accuracy: {summary['top3_accuracy_pct']}%")
    print(f"Top-5 Accuracy: {summary['top5_accuracy_pct']}%")
    print(f"Out-of-Scope Rejection: {summary['out_of_scope_rejection_pct']}%")
    print(f"Results saved to: {summary['csv_path']}")
