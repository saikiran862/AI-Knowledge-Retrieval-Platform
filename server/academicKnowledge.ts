/**
 * Academic Knowledge Engine for B.Tech, BBA, Intermediate (Class 11 & 12), and 10th Class
 * Provides tier & subject classification, rich curriculum syllabus trees, high-yield practice questions,
 * and comprehensive pedagogical academic answer synthesis.
 */

export interface AcademicClassification {
  tier: "btech" | "bba" | "intermediate" | "class10" | "general";
  tierName: string;
  subject: string;
  topic: string;
}

export interface PracticeQuestion {
  id: string;
  tier: "btech" | "bba" | "intermediate" | "class10";
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "Foundation" | "Intermediate" | "Advanced" | "Exam Question";
}

export function classifyAcademicQuery(query: string, requestedTier?: string): AcademicClassification {
  const q = query.toLowerCase();

  // Explicit tier requested by user selector
  if (requestedTier && requestedTier !== "all") {
    if (requestedTier === "btech") {
      return { tier: "btech", tierName: "B.Tech (Engineering)", subject: inferBtechSubject(q), topic: inferTopic(q) };
    }
    if (requestedTier === "bba") {
      return { tier: "bba", tierName: "BBA (Business Administration)", subject: inferBbaSubject(q), topic: inferTopic(q) };
    }
    if (requestedTier === "intermediate") {
      return { tier: "intermediate", tierName: "Intermediate (Class 11 & 12)", subject: inferInterSubject(q), topic: inferTopic(q) };
    }
    if (requestedTier === "class10") {
      return { tier: "class10", tierName: "10th Class (Secondary)", subject: inferClass10Subject(q), topic: inferTopic(q) };
    }
  }

  // 1. Check for B.Tech keywords
  if (
    /\b(btech|b\.tech|engineering|dsa|data structure|binary search tree|avl|heap|bfs|dfs|dijkstra|bellman|knapsack|operating system|cpu scheduling|banker'?s algorithm|semaphore|mutex|paging|segmentation|virtual memory|deadlock|dbms|sql|normalization|1nf|2nf|3nf|bcnf|acid properties|relational algebra|computer networks|tcp\/ip|osi layer|sliding window|subnetting|ip address|eigenvalue|eigenvector|cayley-hamilton|laplace transform|fourier|thevenin|norton|op-amp|bjt|turing machine|automata|dfa|nfa)\b/i.test(q)
  ) {
    return { tier: "btech", tierName: "B.Tech (Engineering)", subject: inferBtechSubject(q), topic: inferTopic(q) };
  }

  // 2. Check for BBA keywords
  if (
    /\b(bba|management|henri fayol|f\.w\. taylor|scientific management|posdcorb|marketing mix|4 ps|4ps|7 ps|stp|segmentation|targeting|positioning|product life cycle|plc|golden rules of accounting|balance sheet|profit and loss|current ratio|cash flow|capital budgeting|npv|irr|business law|indian contract act|hrm|recruitment|selection|performance appraisal|managerial economics|elasticity of demand|maslow|herzberg|theory x)\b/i.test(q)
  ) {
    return { tier: "bba", tierName: "BBA (Business Administration)", subject: inferBbaSubject(q), topic: inferTopic(q) };
  }

  // 3. Check for Intermediate keywords
  if (
    /\b(intermediate|inter|class 11|class 12|mpc|bipc|calculus|differentiation|integration|definite integral|differential equation|matrix inversion|cramer'?s rule|complex numbers|de moivre|projectile motion|carnot engine|carnot cycle|coulomb'?s law|gauss'?s law|wheatstone bridge|photoelectric effect|bohr'?s model|quantum numbers|hybridization|le chatelier|chemical kinetics|arrhenius|sn1|sn2|markovnikov|aldol|cannizzaro|krebs cycle|glycolysis)\b/i.test(q)
  ) {
    return { tier: "intermediate", tierName: "Intermediate (Class 11 & 12)", subject: inferInterSubject(q), topic: inferTopic(q) };
  }

  // 4. Check for 10th Class keywords
  if (
    /\b(10th|class 10|grade 10|ssc|cbse 10|real numbers|euclid|fundamental theorem of arithmetic|irrationality|quadratic equation|discriminant|arithmetic progression|thales theorem|basic proportionality|pythagoras|trigonometric identities|surface area|ohm'?s law|joule'?s law|lens formula|mirror formula|snell'?s law|refractive index|resistors in series|resistors in parallel|fleming'?s left hand|bleaching powder|baking soda|plaster of paris|saponification|homologous series|life processes|photosynthesis|double circulation|nephron|mendel|monohybrid)\b/i.test(q)
  ) {
    return { tier: "class10", tierName: "10th Class (Secondary)", subject: inferClass10Subject(q), topic: inferTopic(q) };
  }

  return { tier: "general", tierName: "Academic Foundations", subject: "General Academic", topic: inferTopic(q) };
}

function inferBtechSubject(q: string): string {
  if (/\b(dsa|data structure|tree|graph|heap|algorithm|sorting|search|dijkstra|knapsack)\b/i.test(q)) return "Data Structures & Algorithms";
  if (/\b(os|operating system|process|thread|semaphore|deadlock|banker|paging|memory)\b/i.test(q)) return "Operating Systems";
  if (/\b(dbms|database|sql|normalization|acid|transaction|relational|key|join)\b/i.test(q)) return "Database Management Systems (DBMS)";
  if (/\b(network|tcp|ip|osi|router|switch|sliding window|dns|http)\b/i.test(q)) return "Computer Networks";
  if (/\b(math|eigen|matrix|laplace|fourier|calculus|differential)\b/i.test(q)) return "Engineering Mathematics";
  if (/\b(circuit|thevenin|norton|diode|transistor|bjt|op-amp|analog)\b/i.test(q)) return "Electronics & Electrical Circuits";
  if (/\b(thermo|heat|mechanics|stress|strain|beam|fluid)\b/i.test(q)) return "Mechanical & Civil Sciences";
  return "Computer Science & Engineering";
}

function inferBbaSubject(q: string): string {
  if (/\b(marketing|4 ps|4ps|stp|plc|branding|advertising|customer)\b/i.test(q)) return "Marketing Management";
  if (/\b(accounting|journal|ledger|balance sheet|ratio|cash flow|npv|financial)\b/i.test(q)) return "Financial Accounting & Management";
  if (/\b(management|fayol|taylor|planning|organizing|leadership|maslow|herzberg)\b/i.test(q)) return "Principles of Management";
  if (/\b(law|contract|company|agreement|act|offer|acceptance)\b/i.test(q)) return "Business Law";
  if (/\b(hrm|human resource|recruitment|selection|training|appraisal)\b/i.test(q)) return "Human Resource Management (HRM)";
  if (/\b(economics|demand|supply|elasticity|market|monopoly|cost)\b/i.test(q)) return "Managerial Economics";
  return "Business Administration Core";
}

function inferInterSubject(q: string): string {
  if (/\b(calculus|integral|derivative|limit|matrix|vector|coordinate|conic|trig)\b/i.test(q)) return "Mathematics (1A/1B/2A/2B)";
  if (/\b(physics|motion|energy|thermodynamics|carnot|coulomb|gauss|wheatstone|optics|photoelectric|bohr)\b/i.test(q)) return "Physics";
  if (/\b(chemistry|hybridization|chemical kinetics|organic|sn1|sn2|aldol|equilibrium|periodic)\b/i.test(q)) return "Chemistry";
  if (/\b(biology|botany|zoology|dna|cell|genetics|photosynthesis|respiration)\b/i.test(q)) return "Biology";
  if (/\b(commerce|account|economics|journal|balance sheet)\b/i.test(q)) return "Commerce & Accountancy";
  return "Intermediate Science & Math";
}

function inferClass10Subject(q: string): string {
  if (/\b(math|polynomial|real number|quadratic|ap|arithmetic progression|triangle|thales|trigonometry|circle|statistics)\b/i.test(q)) return "Mathematics";
  if (/\b(ohm|light|reflection|refraction|lens|mirror|electricity|magnetic|fleming|joule)\b/i.test(q)) return "Science - Physics";
  if (/\b(reaction|acid|base|salt|bleaching|baking soda|pop|metal|carbon|saponification|periodic)\b/i.test(q)) return "Science - Chemistry";
  if (/\b(life process|photosynthesis|digestion|heart|circulation|nephron|reproduction|heredity|mendel)\b/i.test(q)) return "Science - Biology";
  if (/\b(history|nationalism|geography|resource|civics|federalism|economics|money)\b/i.test(q)) return "Social Science";
  return "Class 10 Core Science & Math";
}

function inferTopic(q: string): string {
  const words = q.replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
  return words.slice(0, 3).join(" ").toUpperCase() || "CORE CONCEPT";
}

/**
 * Generates an in-depth, syllabus-grounded academic response for B.Tech, BBA, Intermediate, and 10th Class
 */
export function generateAcademicAnswer(
  query: string,
  tierInfo: AcademicClassification,
  citations: Array<{ document_name: string; page_number?: number; chunk_id: string; similarity_score: number; excerpt: string }>
): string {
  const q = query.toLowerCase();

  // Check matching predefined academic knowledge synthesis
  const customSynthesis = getPredefinedAcademicSynthesis(q);
  if (customSynthesis) {
    return customSynthesis;
  }

  // Structured Academic Answer Engine
  return `### 🎯 Academic Classification
- **Level**: ${tierInfo.tierName}
- **Subject**: ${tierInfo.subject}
- **Curriculum**: Standard University / Board Academic Syllabus (B.Tech / BBA / Intermediate / 10th Class)

---

### 💡 Core Concept & Theoretical Definition
**${query.trim().replace(/\?$/, "")}** represents a fundamental topic in **${tierInfo.subject}**.

In modern academic pedagogy, this concept governs key analytical and problem-solving methodologies:
- **Foundational Definition**: It establishes the relationship between governing parameters under defined theoretical assumptions and boundary conditions.
- **Underlying Principle**: Operates on standard academic principles adhering to conservation laws, relational algebra, systemic management axioms, or formal mathematical rigor depending on the subject domain.

---

### 📐 Mathematical Formulation, Equations & Frameworks
Depending on whether this is an analytical, computational, or management question:

\`\`\`text
[Standard Analytical Model / Governing Formula]
Formula / Governing Law: Parameter_1 = f(Parameter_2, Parameter_3)
Boundary Conditions: Valid under standard temperature/pressure, non-negative inputs, or free market dynamics.
\`\`\`

- **Input Parameters & Constants**: All variables are defined in standard SI units (for Physics/Engineering) or standard accounting formats (for BBA/Commerce).
- **Key Relationships**: Direct and inverse proportionality laws governing the interaction between dependent and independent factors.

---

### 📝 Step-by-Step Analytical Breakdown & Problem Solving
1. **Identify the Given Data**: List all known values, initial conditions, assumptions, or business constraints.
2. **Apply the Core Theorem / Model**: State the primary formula, algorithmic logic (e.g., $O(N \\log N)$ complexity or FIFO/Round-Robin dispatch), or statutory business guideline.
3. **Execute the Derivation / Solution**: Substitute values with proper unit consistency, resolve algebraic steps, or follow the structured analytical framework.
4. **Interpret the Result**: Verify dimensional consistency, stability margins, or strategic organizational viability.

---

### 🔑 High-Yield Exam Notes & Viva Pointers
- **Frequent Exam Questions**: Define the core terms, derive the governing equation, and highlight 2 practical industrial or daily life applications.
- **Common Pitfalls**: Omitting units in final calculation, mixing up sign conventions, or confusing similar concepts (e.g., FCFS vs SJF, SN1 vs SN2, Fayol vs Taylor).
- **Viva Voce Tips**: Be ready to state the exact assumptions and limitations of the model under extreme boundary conditions.

${citations.length > 0 ? `\n---\n### 📚 Grounded Academic Reference Sources\n${citations.map((c, i) => `[Source ${i + 1}] **${c.document_name}** (Page ${c.page_number || 1}) - Chunk: \`${c.chunk_id}\` (Relevance: ${(c.similarity_score * 100).toFixed(1)}%)`).join("\n")}` : ""}`;
}

function getPredefinedAcademicSynthesis(q: string): string | null {
  // 1. Ohm's Law (10th / Inter / B.Tech)
  if (q.includes("ohm's law") || q.includes("ohms law")) {
    return `### 🎯 Academic Classification
- **Level**: 10th Class (Secondary) / Intermediate (Physics) / B.Tech (ECE/EEE)
- **Subject**: Physics & Electrical Circuit Theory
- **Topic**: Ohm's Law, Resistance & Joule's Heating

---

### 💡 Core Concept & Statement
**Ohm's Law** states that:
> *At constant temperature and physical conditions, the steady electric current ($I$) flowing through a metallic conductor is directly proportional to the potential difference ($V$) applied across its ends.*

$$\\mathbf{V \\propto I \\implies V = I \\cdot R}$$

Where:
- $V$ = Electric Potential Difference (measured in **Volts, V**)
- $I$ = Electric Current (measured in **Amperes, A**)
- $R$ = Electrical Resistance of the conductor (measured in **Ohms, $\\Omega$**)

---

### 📐 Governing Equations & Derivation of Joule's Heating
1. **Resistance Formula**:
   $$R = \\rho \\frac{L}{A}$$
   - $\\rho$ = Resistivity of the material (in $\\Omega \\cdot m$)
   - $L$ = Length of conductor (in $m$)
   - $A$ = Cross-sectional area (in $m^2$)

2. **Joule's Law of Heating**:
   Heat energy $H$ dissipated by a resistor:
   $$H = W = V \\cdot I \\cdot t = I^2 R t = \\frac{V^2}{R} t$$
   - $t$ = Time duration in seconds.

3. **Combination of Resistors**:
   - **Series Connection**: $R_{eq} = R_1 + R_2 + R_3$ (Same current $I$, Voltage divides: $V = V_1 + V_2 + V_3$)
   - **Parallel Connection**: $\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$ (Same voltage $V$, Current divides: $I = I_1 + I_2 + I_3$)

---

### 📝 Step-by-Step Problem Solving Example
**Problem**: A heating element has a resistance of $50\\,\\Omega$ connected to a $220\\,\\text{V}$ AC power supply. Calculate (a) the current drawn, and (b) the heat energy produced in 2 minutes.

**Solution**:
1. **Given**: $V = 220\\,\\text{V}$, $R = 50\\,\\Omega$, $t = 2\\,\\text{minutes} = 120\\,\\text{seconds}$.
2. **Current ($I$)**:
   $$I = \\frac{V}{R} = \\frac{220}{50} = 4.4\\,\\text{A}$$
3. **Heat Energy ($H$)**:
   $$H = I^2 \\cdot R \\cdot t = (4.4)^2 \\times 50 \\times 120 = 19.36 \\times 6000 = 116,160\\,\\text{Joules} = 116.16\\,\\text{kJ}$$

---

### 🔑 High-Yield Exam Notes & Viva Tips
- **V-I Graph**: For an ohmic conductor, the V-I plot is a **straight line passing through the origin**, where slope = $R$.
- **Limitations**: Ohm's Law does NOT hold for non-ohmic devices like diodes, transistors, vacuum tubes, and electrolytes.
- **Viva Voce Trap**: Does resistance change if voltage is doubled? *No! Resistance is a physical property determined by material, length, and area. The current doubles instead!*`;
  }

  // 2. Dijkstra's Algorithm (B.Tech CSE)
  if (q.includes("dijkstra") || (q.includes("shortest path") && q.includes("algorithm"))) {
    return `### 🎯 Academic Classification
- **Level**: B.Tech (Computer Science & Engineering / IT)
- **Subject**: Data Structures & Algorithms (CS301 / CS401)
- **Topic**: Graph Theory, Greedy Algorithms & Single-Source Shortest Paths

---

### 💡 Core Concept & Algorithmic Strategy
**Dijkstra's Algorithm** is a greedy algorithm designed by Edsger W. Dijkstra in 1956 to solve the **Single-Source Shortest Path (SSSP)** problem on a weighted directed or undirected graph with **non-negative edge weights**.

It maintains a set of visited vertices whose shortest distance from the source is finalized, iteratively selecting the unvisited vertex with the minimum tentative distance using a Min-Heap / Priority Queue.

---

### 📐 Time & Space Complexity Analysis
- **Using Adjacency Matrix & Linear Array**: $O(V^2)$
- **Using Adjacency List & Min-Priority Queue (Binary Heap)**:
  $$\\mathbf{O((V + E) \\log V)}$$
- **Using Fibonacci Heap**: $O(E + V \\log V)$
- **Space Complexity**: $O(V + E)$ to store graph and distance array.

---

### 📝 C++ / Python Pseudocode Implementation
\`\`\`cpp
#include <vector>
#include <queue>
using namespace std;

typedef pair<int, int> pii; // {weight, vertex}

vector<int> dijkstra(int V, vector<vector<pii>>& adj, int src) {
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    vector<int> dist(V, 1e9);

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        int d = pq.top().first;
        int u = pq.top().second;
        pq.pop();

        if (d > dist[u]) continue;

        for (auto edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second;

            // Relaxation Step
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
\`\`\`

---

### 🔑 High-Yield Exam Questions & Comparison
- **Edge Relaxation Condition**: If $\\text{dist}[u] + w(u, v) < \\text{dist}[v]$, update $\\text{dist}[v] = \\text{dist}[u] + w(u, v)$.
- **Why Non-Negative Weights Only?**: Dijkstra assumes greedy choice: once a node is popped from the priority queue, its shortest distance is finalized. Negative edge weights invalidate this premise, causing incorrect answers or infinite loops.
- **Dijkstra vs Bellman-Ford**: Use **Bellman-Ford ($O(V \\cdot E)$)** when graphs have negative edge weights or negative cycle detection is needed.`;
  }

  // 3. Henri Fayol's 14 Principles (BBA)
  if (q.includes("fayol") || q.includes("14 principles") || (q.includes("principles of management") && q.includes("management"))) {
    return `### 🎯 Academic Classification
- **Level**: BBA (Bachelor of Business Administration) - 1st Year / 1st Semester
- **Subject**: Principles & Practices of Management (PPM)
- **Topic**: Administrative Management Theory (Henri Fayol)

---

### 💡 Theoretical Background
**Henri Fayol** (1841–1925), known as the **"Father of Modern Administrative Management"**, published his seminal work *Administration Industrielle et Générale* in 1916. He articulated that management is a universal skill comprising 5 primary functions (**Planning, Organizing, Commanding, Coordinating, Controlling**) governed by **14 universal principles**.

---

### 📐 The 14 Universal Principles of Management
1. **Division of Work**: Specialization increases output by making employees more efficient.
2. **Authority and Responsibility**: Managers must be able to give orders; authority entails corresponding accountability.
3. **Discipline**: Obedience, respect for agreements, and good supervision at all levels.
4. **Unity of Command**: An employee must receive orders from **one superior only** to prevent confusion and conflict.
5. **Unity of Direction**: One head and one plan for a group of activities having the same objective (*"One team, one plan"*).
6. **Subordination of Individual Interest to General Interest**: The goals of the enterprise take precedence over individual employee desires.
7. **Remuneration**: Fair, equitable compensation that provides maximum possible satisfaction to both employee and employer.
8. **Centralization**: Balance between central decision-making and delegating authority to subordinates.
9. **Scalar Chain (Chain of Command)**: The unbroken formal line of authority from top management to the lowest ranks. Fayol proposed the **"Gang Plank"** for horizontal communication in urgent situations without breaking the chain.
10. **Order**: Social and material order (*"A place for everything and everything in its place"*).
11. **Equity**: Kindness, justice, and fair treatment toward subordinates to elicit loyalty and devotion.
12. **Stability of Tenure of Personnel**: Minimizing high employee turnover to allow employees time to adapt and perform efficiently.
13. **Initiative**: Encouraging personnel to conceive and execute plans with enthusiasm.
14. **Esprit de Corps**: Promoting team spirit, harmony, and mutual trust within the workforce.

---

### 🔑 Critical Exam Distinction: Fayol vs Taylor
| Parameter | Henri Fayol (Administrative Management) | F.W. Taylor (Scientific Management) |
| :--- | :--- | :--- |
| **Perspective** | Top management perspective (Macro level) | Shop-floor / Worker level (Micro level) |
| **Focus** | Overall administrative efficiency & organizational structure | Increasing worker productivity & eliminating waste |
| **Unity of Command** | Strictly emphasized (1 boss per subordinate) | Rejected in favor of **Functional Foremanship** (8 bosses) |
| **Applicability** | Universally applicable across all institutions | Primarily manufacturing and production floors |`;
  }

  // 4. Marketing Mix 4 Ps (BBA)
  if (q.includes("4 ps") || q.includes("4ps") || q.includes("marketing mix")) {
    return `### 🎯 Academic Classification
- **Level**: BBA (Bachelor of Business Administration)
- **Subject**: Marketing Management
- **Topic**: The Marketing Mix (4 Ps Framework)

---

### 💡 Core Definition
Introduced by **E. Jerome McCarthy (1960)** and popularized by **Philip Kotler**, the **Marketing Mix** is the tactical controllable set of marketing tools that a firm blends to produce the response it wants in the target market.

---

### 📐 The 4 Ps Framework Elements
1. **Product (Customer Solution)**:
   - What the organization offers: tangible goods, services, or ideas.
   - Key attributes: Quality, features, branding, packaging, warranty, Product Life Cycle (PLC) management.
2. **Price (Customer Cost)**:
   - The monetary value charged for the product.
   - Pricing strategies: *Penetration pricing* (low initial entry price), *Skimming pricing* (high initial price for innovatives), *Cost-plus pricing*, *Freemium*, *Dynamic pricing*.
3. **Place (Convenience / Distribution)**:
   - The channels and logistics used to make the product accessible to consumers.
   - Channels: Direct (D2C) vs Indirect (Manufacturer -> Wholesaler -> Retailer -> Consumer), supply chain, inventory management.
4. **Promotion (Communication)**:
   - Activities that communicate product merits and persuade target customers to purchase.
   - Promotional Mix: Advertising, Public Relations (PR), Sales Promotion (discounts, coupons), Personal Selling, Direct/Digital Marketing.

---

### 🔑 Extended 7 Ps for Services (Booms & Bitner)
For service industries (Banking, Hospitality, Education, IT Consulting):
5. **People**: Staff, customer service representatives, technical experts who deliver the service.
6. **Process**: The workflows, procedures, and flow of activities by which services are consumed.
7. **Physical Evidence**: The tangible environment where service is performed (store layout, website UI/UX, uniforms, invoices).`;
  }

  // 5. Integration by Parts (Intermediate Math)
  if (q.includes("integration by parts") || q.includes("integral") && q.includes("parts")) {
    return `### 🎯 Academic Classification
- **Level**: Intermediate (Class 12 / MPC) / B.Tech Engineering Mathematics (M1)
- **Subject**: Calculus & Integral Calculus
- **Topic**: Integration by Parts (ILATE Rule)

---

### 💡 Formula & Statement
Integration by Parts is derived from the product rule of differential calculus. For two differentiable functions $u(x)$ and $v(x)$:

$$\\mathbf{\\int u \\cdot v \\, dx = u \\int v \\, dx - \\int \\left( \\frac{du}{dx} \\int v \\, dx \\right) dx}$$

---

### 📐 The ILATE Priority Rule for Choosing $u$
Select the first function $u(x)$ according to priority order:
1. **I** - Inverse Trigonometric functions ($\\arcsin x, \\arctan x$)
2. **L** - Logarithmic functions ($\\ln x, \\log x$)
3. **A** - Algebraic functions ($x^n, x^2 + 1$)
4. **T** - Trigonometric functions ($\\sin x, \\cos x$)
5. **E** - Exponential functions ($e^x, 2^x$)

---

### 📝 Step-by-Step Solved Problem
**Evaluate**: $\\int x \\sin(x) \\, dx$

**Solution**:
1. **Assign functions using ILATE**:
   - Algebraic $x$ comes before Trigonometric $\\sin(x)$.
   - Let $u = x \\implies \\frac{du}{dx} = 1$.
   - Let $v = \\sin(x) \\implies \\int v \\, dx = -\\cos(x)$.
2. **Substitute into formula**:
   $$\\int x \\sin(x) \\, dx = x [-\\cos(x)] - \\int 1 \\cdot [-\\cos(x)] \\, dx$$
   $$= -x \\cos(x) + \\int \\cos(x) \\, dx$$
   $$= -x \\cos(x) + \\sin(x) + C$$
3. **Final Result**:
   $$\\mathbf{\\int x \\sin(x) \\, dx = \\sin(x) - x \\cos(x) + C}$$`;
  }

  // 6. Carnot Engine (Intermediate / B.Tech)
  if (q.includes("carnot") || q.includes("heat engine")) {
    return `### 🎯 Academic Classification
- **Level**: Intermediate (Class 11 / Physics) / B.Tech (Mechanical / Thermodynamics)
- **Subject**: Thermodynamics
- **Topic**: Carnot Ideal Cycle & Thermal Efficiency

---

### 💡 Core Concept & Second Law of Thermodynamics
The **Carnot Engine** is an ideal theoretical reversible heat engine proposed by Nicolas Léonard Sadi Carnot in 1824. It operates between two thermal reservoirs: a heat source at temperature $T_1$ (or $T_H$) and a heat sink at lower temperature $T_2$ (or $T_C$).

According to Carnot's Theorem:
> *No real heat engine operating between two given temperatures can be more efficient than a reversible Carnot engine operating between the same two temperatures.*

---

### 📐 The 4 Steps of the Carnot Cycle
1. **Step 1: Reversible Isothermal Expansion (A -> B)**:
   - Gas absorbs heat $Q_1$ from source at constant temperature $T_1$.
   - Work done: $W_1 = n R T_1 \\ln\\left(\\frac{V_2}{V_1}\\right)$.
2. **Step 2: Reversible Adiabatic Expansion (B -> C)**:
   - Gas expands with zero heat transfer ($Q = 0$); temperature drops from $T_1$ to $T_2$.
   - $P V^\\gamma = \\text{constant}$.
3. **Step 3: Reversible Isothermal Compression (C -> D)**:
   - Gas rejects heat $Q_2$ into sink at constant temperature $T_2$.
   - Work done: $W_3 = -n R T_2 \\ln\\left(\\frac{V_3}{V_4}\\right)$.
4. **Step 4: Reversible Adiabatic Compression (D -> A)**:
   - Gas is compressed adiabatically, restoring temperature back from $T_2$ to $T_1$.

---

### 📐 Thermal Efficiency Derivation
$$\\eta = \\frac{\\text{Net Work Output}}{\\text{Heat Input}} = \\frac{W}{Q_1} = \\frac{Q_1 - Q_2}{Q_1} = 1 - \\frac{Q_2}{Q_1}$$

Since $\\frac{Q_2}{Q_1} = \\frac{T_2}{T_1}$ for a reversible cycle:
$$\\mathbf{\\eta = 1 - \\frac{T_2}{T_1} = \\frac{T_1 - T_2}{T_1}}$$

*(Note: Temperatures $T_1$ and $T_2$ must strictly be in **Kelvin**).*

---

### 🔑 Key Exam Takeaway
- Efficiency $\\eta$ reaches $100\\%$ ($1.0$) only if the sink temperature $T_2 = 0\\,\\text{K}$ (Absolute Zero), which is unattainable according to the Third Law of Thermodynamics.`;
  }

  // 7. ACID Properties (B.Tech CSE)
  if (q.includes("acid") && (q.includes("dbms") || q.includes("database") || q.includes("properties"))) {
    return `### 🎯 Academic Classification
- **Level**: B.Tech (Computer Science & Engineering) / MCA
- **Subject**: Database Management Systems (DBMS)
- **Topic**: Transaction Management & Concurrency Control

---

### 💡 Definition of a Transaction
A **Transaction** in DBMS is a single logical unit of work that accesses and potentially modifies the contents of a database. To ensure data integrity, the DBMS must guarantee the **ACID** properties:

---

### 📐 Detailed Explanation of ACID Properties
1. **A - Atomicity ("All or Nothing")**:
   - The entire transaction executes to completion, or none of its operations take effect.
   - If an error or crash occurs mid-way, the database is rolled back to its pre-transaction state.
   - **Enforced by**: The **Recovery Management Subsystem** using write-ahead transaction logs (WAL).
2. **C - Consistency**:
   - Execution of a transaction in isolation preserves database invariants and constraints (e.g., balance $\\ge 0$, primary key uniqueness).
   - The database moves from one valid consistent state to another valid consistent state.
   - **Enforced by**: Database constraints (Foreign keys, CHECK constraints) and application logic.
3. **I - Isolation**:
   - Multiple concurrent transactions execute without interfering with one another. Intermediate states of one transaction are invisible to other transactions.
   - **Enforced by**: **Concurrency Control Subsystem** via 2-Phase Locking (2PL), Timestamp Ordering, or Multi-Version Concurrency Control (MVCC).
   - SQL Isolation Levels: *Read Uncommitted, Read Committed, Repeatable Read, Serializable*.
4. **D - Durability**:
   - Once a transaction is committed, its updates persist permanently in secondary storage, even in the event of a system crash, power outage, or OS failure.
   - **Enforced by**: Non-volatile storage flushing and checkpointing with recovery logs.

---

### 📝 Real-World Banking Example
Consider transferring $\\$100$ from Account A to Account B:
1. Read(A)
2. A = A - 100
3. Write(A)
4. *[If system crashes here, **Atomicity** rolls back step 3 so A does not lose $100]*
5. Read(B)
6. B = B + 100
7. Write(B)
8. Commit. Once committed, **Durability** guarantees B has the funds even if power fails.`;
  }

  return null;
}

/**
 * Returns structured curriculum data across B.Tech, BBA, Intermediate, and 10th Class
 */
export function getCurriculumTree() {
  return [
    {
      id: "btech",
      name: "B.Tech (Engineering & Tech)",
      icon: "GraduationCap",
      description: "4-Year Bachelor of Technology across Computer Science, Electronics, Mechanical, Civil & Common Engineering Mathematics",
      branches: [
        {
          code: "CSE",
          name: "Computer Science & Engineering",
          semesters: [
            {
              sem: "Core Computer Science",
              subjects: [
                {
                  code: "CS201",
                  title: "Data Structures & Algorithms",
                  modules: ["Arrays & Linked Lists", "Stacks & Queues", "Trees (BST, AVL, Red-Black)", "Graph Algorithms (BFS, DFS, Dijkstra)", "Dynamic Programming", "Greedy & Divide-and-Conquer"],
                },
                {
                  code: "CS202",
                  title: "Operating Systems",
                  modules: ["Processes & Threads", "CPU Scheduling (FCFS, SJF, Round Robin)", "Process Synchronization & Semaphores", "Deadlocks & Banker's Algorithm", "Memory Paging & Virtual Memory"],
                },
                {
                  code: "CS203",
                  title: "Database Management Systems (DBMS)",
                  modules: ["Relational Algebra & SQL", "ER Modeling", "Normalization (1NF to BCNF)", "ACID Properties & Transactions", "Concurrency Control & 2PL"],
                },
                {
                  code: "CS204",
                  title: "Computer Networks",
                  modules: ["OSI 7 Layers & TCP/IP", "Data Link Layer & MAC", "Network Layer & Routing Protocols", "Transport Layer (TCP Handshake, UDP)", "Application Protocols (HTTP, DNS)"],
                },
              ],
            },
          ],
        },
        {
          code: "ENG_MATH",
          name: "Engineering Mathematics (All Branches)",
          semesters: [
            {
              sem: "Mathematics Foundations",
              subjects: [
                {
                  code: "MA101",
                  title: "Linear Algebra & Calculus",
                  modules: ["Eigenvalues & Eigenvectors", "Cayley-Hamilton Theorem", "Multivariable Calculus & Partial Derivatives", "Gradient, Divergence & Curl"],
                },
                {
                  code: "MA102",
                  title: "Differential Equations & Vector Calculus",
                  modules: ["First & Second Order ODEs", "Laplace Transforms & Inverses", "Fourier Series", "Green's, Stokes' & Gauss Theorems"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "bba",
      name: "BBA (Business Administration)",
      icon: "Briefcase",
      description: "Bachelor of Business Administration covering Marketing, Finance, HR, Business Law & Strategic Management",
      branches: [
        {
          code: "MGMT",
          name: "Management & Strategy",
          semesters: [
            {
              sem: "Core Business Management",
              subjects: [
                {
                  code: "BBA101",
                  title: "Principles of Management",
                  modules: ["Fayol's 14 Principles", "Scientific Management (F.W. Taylor)", "POSDCORB Management Functions", "Motivation Theories (Maslow, Herzberg, McGregor)", "Leadership Styles"],
                },
                {
                  code: "BBA102",
                  title: "Marketing Management",
                  modules: ["Marketing Mix (4 Ps & 7 Ps)", "STP (Segmentation, Targeting, Positioning)", "Product Life Cycle (PLC)", "Consumer Behavior", "Digital Marketing"],
                },
                {
                  code: "BBA103",
                  title: "Financial Accounting & Management",
                  modules: ["Double Entry & Golden Rules", "Balance Sheet & P&L Analysis", "Financial Ratios (Current, Liquidity, Debt-Equity)", "Capital Budgeting (NPV, IRR, Payback)"],
                },
                {
                  code: "BBA104",
                  title: "Business Law & HRM",
                  modules: ["Indian Contract Act 1872", "Essentials of Valid Contract", "HR Planning & Job Analysis", "Recruitment vs Selection", "Performance Appraisal"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "intermediate",
      name: "Intermediate (Class 11 & 12)",
      icon: "Atom",
      description: "Senior Secondary / Pre-University Education for MPC (Maths, Physics, Chem), BiPC (Biology), and MEC (Commerce)",
      branches: [
        {
          code: "MPC",
          name: "MPC Stream (Maths, Physics, Chemistry)",
          semesters: [
            {
              sem: "11th & 12th Grade Syllabus",
              subjects: [
                {
                  code: "MATH_INTER",
                  title: "Mathematics (1A, 1B, 2A, 2B)",
                  modules: ["Functions & Matrices (Cramer's Rule)", "Complex Numbers & De Moivre's Theorem", "Calculus (Limits, Differentiation, Integration by Parts)", "Definite Integrals & Differential Equations", "Coordinate Geometry & Conic Sections"],
                },
                {
                  code: "PHY_INTER",
                  title: "Physics",
                  modules: ["Kinematics & Projectile Motion", "Newton's Laws & Work-Energy Theorem", "Thermodynamics & Carnot Engine", "Electrostatics (Coulomb's Law, Gauss)", "Current Electricity (Kirchhoff's Laws)", "Optics & Modern Physics (Photoelectric Effect)"],
                },
                {
                  code: "CHEM_INTER",
                  title: "Chemistry",
                  modules: ["Atomic Structure & Quantum Numbers", "Chemical Bonding & Hybridization", "Chemical Kinetics & Arrhenius Equation", "Organic Mechanisms (SN1, SN2, Markovnikov)", "Name Reactions (Aldol, Cannizzaro)"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "class10",
      name: "10th Class (Secondary Education)",
      icon: "BookOpen",
      description: "CBSE, ICSE, and State Board Class 10 Secondary Education Curriculum (Math, Science, Social)",
      branches: [
        {
          code: "SEC_CORE",
          name: "Class 10 Core Board Curriculum",
          semesters: [
            {
              sem: "Board Exam Syllabus",
              subjects: [
                {
                  code: "MATH_10",
                  title: "Mathematics",
                  modules: ["Real Numbers & Fundamental Theorem of Arithmetic", "Polynomials & Quadratic Equations", "Arithmetic Progressions (AP)", "Triangles & Thales Theorem", "Introduction to Trigonometry & Identities", "Statistics (Mean, Median, Mode)"],
                },
                {
                  code: "SCI_10",
                  title: "Science (Physics, Chemistry, Biology)",
                  modules: ["Light: Reflection, Refraction & Lens Formula", "Electricity (Ohm's Law, Resistors in Series/Parallel, Joule's Heating)", "Chemical Reactions & Equations", "Acids, Bases & Salts (pH, Plaster of Paris, Baking Soda)", "Carbon & Compounds (Homologous Series, Saponification)", "Life Processes (Nutrition, Respiration, Circulation, Excretion)"],
                },
                {
                  code: "SOC_10",
                  title: "Social Science",
                  modules: ["Nationalism in India & Europe", "Resources & Sustainable Development", "Power Sharing & Federalism", "Money and Credit & Globalization"],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

/**
 * High-yield practice questions across all 4 tiers
 */
export function getPracticeQuestionsList(tier?: string, subject?: string): PracticeQuestion[] {
  const allQuestions: PracticeQuestion[] = [
    // B.Tech
    {
      id: "pq_btech_1",
      tier: "btech",
      subject: "Data Structures & Algorithms",
      topic: "Shortest Path",
      question: "What is the time complexity of Dijkstra's Algorithm implemented with an adjacency list and a binary min-heap for a graph with V vertices and E edges?",
      options: ["O(V^2)", "O((V + E) log V)", "O(V * E)", "O(V^3)"],
      correctIndex: 1,
      explanation: "Using an adjacency list with a binary min-heap (priority queue), extracting min takes O(log V) for V vertices, and relaxation takes O(log V) for E edges, yielding O((V + E) log V).",
      difficulty: "Intermediate",
    },
    {
      id: "pq_btech_2",
      tier: "btech",
      subject: "Operating Systems",
      topic: "Deadlocks",
      question: "Which algorithm is utilized for deadlock avoidance in operating systems by verifying the safe state before allocating requested resources?",
      options: ["Peterson's Algorithm", "Banker's Algorithm", "Round Robin Scheduling", "LRU Page Replacement"],
      correctIndex: 1,
      explanation: "Edsger Dijkstra's Banker's Algorithm simulates resource allocation to check whether the system remains in a 'safe state' before granting a resource request.",
      difficulty: "Exam Question",
    },
    {
      id: "pq_btech_3",
      tier: "btech",
      subject: "Database Management Systems",
      topic: "Normalization",
      question: "A relation is in Boyce-Codd Normal Form (BCNF) if for every non-trivial functional dependency X -> Y:",
      options: ["Y is a prime attribute", "X is a superkey", "X is a candidate key and Y is atomic", "There are no multi-valued dependencies"],
      correctIndex: 1,
      explanation: "BCNF is a stricter version of 3NF. For every functional dependency X -> Y, the determinant X must be a superkey of the relation.",
      difficulty: "Advanced",
    },

    // BBA
    {
      id: "pq_bba_1",
      tier: "bba",
      subject: "Principles of Management",
      topic: "Henri Fayol",
      question: "According to Henri Fayol's 14 Principles of Management, the 'Gang Plank' is used to:",
      options: ["Punish non-performing employees", "Enable direct horizontal communication bypassing the formal scalar chain in emergencies", "Formulate the annual marketing budget", "Enforce strict vertical hierarchy without exception"],
      correctIndex: 1,
      explanation: "The Gang Plank allows two employees of the same hierarchical level to communicate directly with mutual permission, preventing dangerous administrative delays in emergencies.",
      difficulty: "Exam Question",
    },
    {
      id: "pq_bba_2",
      tier: "bba",
      subject: "Marketing Management",
      topic: "Marketing Mix",
      question: "In the 7 Ps of Service Marketing, which element encompasses the decor, website interface, ambiance, and uniforms?",
      options: ["Process", "People", "Physical Evidence", "Placement"],
      correctIndex: 2,
      explanation: "Physical Evidence refers to the environment in which the service is delivered and where the firm and customer interact, along with any tangible commodities that facilitate performance.",
      difficulty: "Intermediate",
    },
    {
      id: "pq_bba_3",
      tier: "bba",
      subject: "Financial Accounting",
      topic: "Golden Rules",
      question: "According to the Golden Rules of Accounting, what is the rule for Nominal Accounts?",
      options: ["Debit the receiver, Credit the giver", "Debit what comes in, Credit what goes out", "Debit all expenses and losses, Credit all incomes and gains", "Debit all assets, Credit all liabilities"],
      correctIndex: 2,
      explanation: "Nominal Accounts relate to revenue, expenses, gains, and losses: Debit all expenses & losses, Credit all incomes & gains.",
      difficulty: "Foundation",
    },

    // Intermediate
    {
      id: "pq_inter_1",
      tier: "intermediate",
      subject: "Physics",
      topic: "Thermodynamics",
      question: "A Carnot engine operates between temperatures 500 K (source) and 300 K (sink). Its thermal efficiency is:",
      options: ["20%", "40%", "60%", "75%"],
      correctIndex: 1,
      explanation: "Efficiency = (T1 - T2) / T1 = (500 - 300) / 500 = 200 / 500 = 0.40 or 40%.",
      difficulty: "Intermediate",
    },
    {
      id: "pq_inter_2",
      tier: "intermediate",
      subject: "Mathematics",
      topic: "Calculus",
      question: "What is the value of the integral ∫ x * e^x dx?",
      options: ["e^x * (x - 1) + C", "e^x * (x + 1) + C", "x^2 * e^x + C", "e^x / x + C"],
      correctIndex: 0,
      explanation: "Using Integration by parts: u = x, v = e^x. ∫ x e^x dx = x * e^x - ∫ 1 * e^x dx = x e^x - e^x + C = e^x(x - 1) + C.",
      difficulty: "Exam Question",
    },
    {
      id: "pq_inter_3",
      tier: "intermediate",
      subject: "Chemistry",
      topic: "Organic Chemistry",
      question: "An SN1 reaction mechanism on an alkyl halide typically involves:",
      options: ["A single bimolecular transition state with Walden inversion", "A two-step mechanism via a planar carbocation intermediate resulting in racemization", "Elimination of hydrogen halide to form an alkyne", "Zero dependence on carbocation stability"],
      correctIndex: 1,
      explanation: "SN1 is a unimolecular substitution proceeding through a planar carbocation intermediate in the slow rate-determining step, leading to both retention and inversion (racemization).",
      difficulty: "Advanced",
    },

    // 10th Class
    {
      id: "pq_class10_1",
      tier: "class10",
      subject: "Science - Physics",
      topic: "Electricity",
      question: "Three resistors of 2 Ω, 3 Ω, and 6 Ω are connected in parallel across a 12V battery. What is the equivalent resistance of the circuit?",
      options: ["11 Ω", "1 Ω", "2 Ω", "3.6 Ω"],
      correctIndex: 1,
      explanation: "1/Rp = 1/2 + 1/3 + 1/6 = (3 + 2 + 1)/6 = 6/6 = 1. Therefore, Rp = 1 Ω.",
      difficulty: "Intermediate",
    },
    {
      id: "pq_class10_2",
      tier: "class10",
      subject: "Mathematics",
      topic: "Quadratic Equations",
      question: "If the discriminant D = b^2 - 4ac of a quadratic equation ax^2 + bx + c = 0 is greater than 0, the roots are:",
      options: ["Real and equal", "Real and distinct", "Complex and imaginary", "Infinite"],
      correctIndex: 1,
      explanation: "When D > 0, the quadratic formula yields two distinct real roots: x = (-b ± √D) / (2a).",
      difficulty: "Foundation",
    },
    {
      id: "pq_class10_3",
      tier: "class10",
      subject: "Science - Chemistry",
      topic: "Acids, Bases & Salts",
      question: "What is the chemical formula of Plaster of Paris (POP)?",
      options: ["CaSO4 · 2H2O", "CaSO4 · 1/2H2O", "CaOCl2", "NaHCO3"],
      correctIndex: 1,
      explanation: "Plaster of Paris is Calcium Sulphate Hemihydrate (CaSO4 · 1/2H2O), produced by heating Gypsum (CaSO4 · 2H2O) at 373 K.",
      difficulty: "Exam Question",
    },
  ];

  if (tier && tier !== "all") {
    return allQuestions.filter((q) => q.tier === tier);
  }
  return allQuestions;
}
