const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  PageNumber
} = require('docx');

// Helper: standard font styles
const FONT_BODY = 'Times New Roman';
const FONT_CODE = 'Consolas';

// Standard 1.5 line spacing config: line = 360, space after = 120 (6pt)
const PARAGRAPH_SPACING = { line: 360, after: 140 };

function createHeading1(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 160 },
    alignment: AlignmentType.LEFT,
    run: {
      font: FONT_BODY,
      size: 32, // 16pt
      bold: true,
      color: '1E293B'
    }
  });
}

function createHeading2(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
    alignment: AlignmentType.LEFT,
    run: {
      font: FONT_BODY,
      size: 28, // 14pt
      bold: true,
      color: '334155'
    }
  });
}

function createHeading3(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 80 },
    alignment: AlignmentType.LEFT,
    run: {
      font: FONT_BODY,
      size: 24, // 12pt
      bold: true,
      color: '475569'
    }
  });
}

function createBodyPara(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFY,
    spacing: PARAGRAPH_SPACING,
    children: [
      new TextRun({
        text: text,
        font: FONT_BODY,
        size: 24, // 12pt
        bold: options.bold || false,
        italics: options.italics || false,
        color: options.color || '111827'
      })
    ]
  });
}

function createMixedPara(runs, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFY,
    spacing: PARAGRAPH_SPACING,
    children: runs.map(r => new TextRun({
      text: r.text,
      font: r.font || FONT_BODY,
      size: r.size || 24,
      bold: r.bold || false,
      italics: r.italics || false,
      color: r.color || '111827'
    }))
  });
}

function createBulletItem(boldPrefix, text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { line: 360, after: 80 },
    alignment: AlignmentType.JUSTIFY,
    children: [
      new TextRun({
        text: boldPrefix,
        font: FONT_BODY,
        size: 24,
        bold: true
      }),
      new TextRun({
        text: text,
        font: FONT_BODY,
        size: 24
      })
    ]
  });
}

function createCodeBlock(lines) {
  return lines.map((line, idx) => new Paragraph({
    spacing: { line: 240, after: idx === lines.length - 1 ? 160 : 20 },
    shading: { fill: 'F8FAFC' },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: 'CBD5E1' }
    },
    children: [
      new TextRun({
        text: '  ' + line,
        font: FONT_CODE,
        size: 19, // ~9.5pt
        color: '0F172A'
      })
    ]
  }));
}

// Table generator helper
function createTable(headers, rowsData, colWidths = []) {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
    left: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
    right: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
      shading: { fill: 'E2E8F0' },
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: h,
              font: FONT_BODY,
              size: 22, // 11pt
              bold: true,
              color: '0F172A'
            })
          ]
        })
      ]
    }))
  });

  const bodyRows = rowsData.map(row => new TableRow({
    children: row.map((cellText, i) => new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [
        new Paragraph({
          alignment: i === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { line: 280, after: 0 },
          children: [
            new TextRun({
              text: cellText,
              font: FONT_BODY,
              size: 21, // ~10.5pt
              color: '1E293B'
            })
          ]
        })
      ]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorder,
    rows: [headerRow, ...bodyRows]
  });
}

async function buildDocument() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_BODY,
            size: 24,
            color: '111827'
          }
        }
      }
    },
    sections: [
      // ==========================================
      // SECTION 1: COVER PAGE
      // ==========================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 } // 1.25" left margin for binding
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({ text: "A PROJECT REPORT", font: FONT_BODY, size: 28, bold: true, color: '1E293B' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 360 },
            children: [
              new TextRun({ text: "ON", font: FONT_BODY, size: 24, bold: true, color: '475569' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 120 },
            children: [
              new TextRun({ text: "TASK MANAGER WEB APPLICATION", font: FONT_BODY, size: 40, bold: true, color: '1D4ED8' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 480 },
            children: [
              new TextRun({ text: "(Full-Stack Task Management System)", font: FONT_BODY, size: 28, italics: true, color: '334155' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 120 },
            children: [
              new TextRun({ text: "Submitted in partial fulfillment of the requirements for the award of the degree of", font: FONT_BODY, size: 22, italics: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({ text: "BACHELOR OF ENGINEERING", font: FONT_BODY, size: 30, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "IN", font: FONT_BODY, size: 22, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 400 },
            children: [
              new TextRun({ text: "INFORMATION TECHNOLOGY", font: FONT_BODY, size: 28, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 320 },
            children: [
              new TextRun({ text: "(3rd Semester, R22A Regulation)", font: FONT_BODY, size: 24, bold: true, color: '475569' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({ text: "Submitted By:", font: FONT_BODY, size: 24, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 400 },
            children: [
              new TextRun({ text: "RONAK SARDA", font: FONT_BODY, size: 30, bold: true, color: '0F172A' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 60 },
            children: [
              new TextRun({ text: "DEPARTMENT OF INFORMATION TECHNOLOGY", font: FONT_BODY, size: 26, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({ text: "CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY (A)", font: FONT_BODY, size: 28, bold: true, color: '1E3A8A' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 60 },
            children: [
              new TextRun({ text: "(Affiliated to Osmania University, Approved by AICTE, Accredited by NBA & NAAC with A++ Grade)", font: FONT_BODY, size: 19, italics: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "Gandipet, Hyderabad, Telangana – 500075", font: FONT_BODY, size: 22 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 0 },
            children: [
              new TextRun({ text: "Academic Year: 2026–2027", font: FONT_BODY, size: 24, bold: true })
            ]
          }),
          new Paragraph({ children: [new PageBreak()] })
        ]
      },

      // ==========================================
      // SECTION 2: PRELIMINARY PAGES (CERTIFICATE, DECLARATION, ACKNOWLEDGEMENT, ABSTRACT, TOC)
      // ==========================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 }
          }
        },
        children: [
          // CERTIFICATE
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: "CERTIFICATE", font: FONT_BODY, size: 32, bold: true, underline: true })]
          }),
          createBodyPara(
            "This is to certify that the Internship-1 Project Report entitled \"TASK MANAGER WEB APPLICATION\" is a bona fide record of work carried out by RONAK SARDA in partial fulfillment for the award of the Degree of Bachelor of Engineering in Information Technology (3rd Semester, R22A Regulation) from Chaitanya Bharathi Institute of Technology (Autonomous), Hyderabad, affiliated to Osmania University, during the academic year 2026–2027."
          ),
          createBodyPara(
            "The project embodies original work conducted under supervision, satisfies academic rigor, and complies with all institutional guidelines prescribed by the Department of Information Technology."
          ),
          new Paragraph({ spacing: { before: 800, after: 200 } }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({ text: "------------------------------------", font: FONT_BODY, size: 22, bold: true }),
              new TextRun({ text: "\t\t\t\t------------------------------------", font: FONT_BODY, size: 22, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({ text: "Internal Faculty Guide", font: FONT_BODY, size: 22, bold: true }),
              new TextRun({ text: "\t\t\t\tHead of the Department", font: FONT_BODY, size: 22, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({ text: "Dept. of Information Technology\nCBIT (A), Hyderabad", font: FONT_BODY, size: 20 }),
              new TextRun({ text: "\t\t\t\tDept. of Information Technology\nCBIT (A), Hyderabad", font: FONT_BODY, size: 20 })
            ]
          }),
          new Paragraph({ spacing: { before: 600, after: 100 } }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: "------------------------------------\nExternal Examiner", font: FONT_BODY, size: 22, bold: true })
            ]
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // DECLARATION
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: "DECLARATION", font: FONT_BODY, size: 32, bold: true, underline: true })]
          }),
          createBodyPara(
            "I, Ronak Sarda, hereby declare that the project report entitled \"TASK MANAGER WEB APPLICATION\", submitted to the Department of Information Technology, Chaitanya Bharathi Institute of Technology (A), Hyderabad, for the fulfillment of the requirements of the 3rd Semester Internship-1 curriculum under the R22A regulation, is a record of independent and original work carried out by me."
          ),
          createBodyPara(
            "I further declare that this report has not previously formed the basis for the award of any Degree, Diploma, Associateship, Fellowship, or other similar title to any candidate of any University or Institution."
          ),
          new Paragraph({ spacing: { before: 800, after: 100 } }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({ text: "Date: 30-10-2026\nPlace: Hyderabad", font: FONT_BODY, size: 22, bold: true }),
              new TextRun({ text: "\t\t\t\t\tRonak Sarda\n\t\t\t\t\tB.E. Information Technology (3rd Sem)\n\t\t\t\t\tCBIT (A), Hyderabad", font: FONT_BODY, size: 22, bold: true })
            ]
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // ACKNOWLEDGEMENT
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: "ACKNOWLEDGEMENT", font: FONT_BODY, size: 32, bold: true, underline: true })]
          }),
          createBodyPara(
            "I express my deepest gratitude to the Management of Chaitanya Bharathi Institute of Technology (Autonomous) and our respected Principal for providing the necessary infrastructure, laboratory facilities, and academic atmosphere that enabled the completion of this Internship-1 project."
          ),
          createBodyPara(
            "I extend my heartfelt gratitude to the Head of the Department, Department of Information Technology, for institutional leadership, constant motivation, and departmental encouragement throughout the semester."
          ),
          createBodyPara(
            "I am profoundly indebted to my Internal Faculty Guide for invaluable guidance, patient mentoring, constructive technical critique, and consistent encouragement during every phase of this project. Their insights into full-stack software architecture, asynchronous networking, and API design principles were instrumental in shaping this application."
          ),
          createBodyPara(
            "Finally, I would like to thank the faculty members, technical laboratory staff of the IT department, my peers, and my family for their continuous moral support and cooperation during the tenure of this internship."
          ),
          new Paragraph({ spacing: { before: 600, after: 100 } }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Ronak Sarda\nB.E. Information Technology (3rd Semester)\nChaitanya Bharathi Institute of Technology (A)", font: FONT_BODY, size: 22, bold: true })
            ]
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // ABSTRACT
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: "ABSTRACT", font: FONT_BODY, size: 32, bold: true, underline: true })]
          }),
          createBodyPara(
            "The proliferation of digital productivity environments necessitates streamlined, lightweight task management tools that deliver rapid responsiveness without the overhead of resource-heavy client-side frameworks. This project presents the design and implementation of a full-stack Task Manager Web Application, engineered to establish robust client-server interaction through standard, dependency-minimized web technologies. The backend tier is constructed using Node.js and Express.js, exposing a RESTful Application Programming Interface (API) responsible for servicing state transitions, CRUD operations, and structured JSON payloads. The persistence and storage tier abstracts structured entity lifecycles, enabling deterministic data updates. The presentation tier is developed exclusively using semantic HTML5, Vanilla CSS3, and standard ECMAScript (Vanilla JavaScript), consciously bypassing heavy front-end libraries to eliminate compilation latency and ensure zero runtime bloat. Client-server synchronization is realized asynchronously utilizing the native Fetch API, implementing dynamic Document Object Model (DOM) mutation, event delegation, and real-time state reflection without full-page reloads. The application demonstrates core competencies in modular backend routing, CORS handling, asynchronous JavaScript execution, semantic frontend structuring, and responsive user-interface design, satisfying all functional and academic criteria outlined in the 3rd Semester R22A curriculum for undergraduate studies in Information Technology."
          ),
          new Paragraph({ children: [new PageBreak()] }),

          // TABLE OF CONTENTS
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 300 },
            children: [new TextRun({ text: "TABLE OF CONTENTS", font: FONT_BODY, size: 32, bold: true, underline: true })]
          }),
          createTable(
            ['Chapter No.', 'Title', 'Page No.'],
            [
              ['', 'Certificate', 'ii'],
              ['', 'Declaration', 'iii'],
              ['', 'Acknowledgement', 'iv'],
              ['', 'Abstract', 'v'],
              ['1', 'Introduction', '1'],
              ['', '1.1 Background and Motivation', '1'],
              ['', '1.2 Problem Statement', '2'],
              ['', '1.3 Project Objectives', '2'],
              ['', '1.4 Scope and Applicability', '3'],
              ['2', 'System Requirements & Technology Stack', '4'],
              ['', '2.1 Hardware Requirements', '4'],
              ['', '2.2 Software Requirements', '4'],
              ['', '2.3 Technology Stack Justification', '5'],
              ['3', 'System Design & Architecture', '8'],
              ['', '3.1 Client-Server Tier Architecture', '8'],
              ['', '3.2 RESTful API Design and Endpoint Specification', '9'],
              ['', '3.3 End-to-End Data Flow', '10'],
              ['', '3.4 Data Integrity & State Management', '11'],
              ['4', 'Implementation & Source Code Structure', '12'],
              ['', '4.1 Directory and File Structure', '12'],
              ['', '4.2 Backend Implementation Details', '13'],
              ['', '4.3 Frontend Implementation Details', '16'],
              ['5', 'Testing and Results', '20'],
              ['', '5.1 Test Methodology', '20'],
              ['', '5.2 API Verification and Functional Test Cases', '20'],
              ['', '5.3 User Interface Execution and Interaction Workflow', '22'],
              ['6', 'Conclusion and Future Scope', '24'],
              ['', '6.1 Academic and Technical Learning Outcomes', '24'],
              ['', '6.2 Future Enhancements', '25'],
              ['', 'References', '26']
            ],
            [1400, 5800, 1200]
          ),
          new Paragraph({ children: [new PageBreak()] })
        ]
      },

      // ==========================================
      // SECTION 3: MAIN REPORT BODY (CHAPTERS 1 to 6 & REFERENCES)
      // ==========================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({ text: "Task Manager Web Application | CBIT IT (R22A)", font: FONT_BODY, size: 18, italics: true, color: '64748B' })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Page ", font: FONT_BODY, size: 20 }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 20 })
                ]
              })
            ]
          })
        },
        children: [
          // ----------------------------------------------------
          // CHAPTER 1
          // ----------------------------------------------------
          createHeading1("CHAPTER 1: INTRODUCTION"),
          createHeading2("1.1 Background and Motivation"),
          createBodyPara(
            "In modern computing environments, personal and team task management systems represent one of the most fundamental classes of productivity software. While modern commercial solutions such as Jira, Asana, and Linear provide exhaustive enterprise functionality, they frequently impose substantial computational overhead, intricate dependencies, and steep learning curves. For individual developers, academic practitioners, and focused project units, there exists a persistent demand for lightweight, deterministic, and highly responsive task management systems."
          ),
          createBodyPara(
            "From an academic perspective within the undergraduate Information Technology curriculum (R22A regulation at Chaitanya Bharathi Institute of Technology), developing a task management system serves as an exemplary pedagogical vehicle. It synthesizes foundational principles across the software engineering spectrum:"
          ),
          createBulletItem("1. Networked Communication: ", "Understanding stateless HTTP communication over TCP/IP."),
          createBulletItem("2. Server-Side Computing: ", "Managing asynchronous event loops, request parsing, and routing."),
          createBulletItem("3. Data Representation: ", "Handling serialized JavaScript Object Notation (JSON) payloads."),
          createBulletItem("4. Client-Side Rendering: ", "Manipulating the Document Object Model (DOM) dynamically in response to asynchronous network events."),
          createBodyPara(
            "By consciously avoiding high-abstraction client-side meta-frameworks, this project emphasizes mastery over core web standards, illuminating the exact mechanics of browser-to-server data transmission."
          ),

          createHeading2("1.2 Problem Statement"),
          createBodyPara(
            "Many contemporary introductory full-stack applications suffer from excessive dependency chains, bloated client runtimes, and opaque build pipelines (e.g., Webpack, Babel, complex bundlers) that obscure the foundational mechanics of web engineering. Furthermore, generic introductory tutorials frequently demonstrate simplistic client-only state storage (such as browser localStorage), failing to teach genuine client-server separation, RESTful conventions, status transitions, or server-side data validation."
          ),
          createBodyPara(
            "The objective of this project is to resolve these educational and technical shortcomings by engineering a clean, production-grade, zero-bloat full-stack Task Management System that strictly enforces architectural separation of concerns between client and server using native protocols."
          ),

          createHeading2("1.3 Project Objectives"),
          createBodyPara(
            "The principal objectives of this Internship-1 project are formulated as follows:"
          ),
          createBulletItem("• Design and Deploy a Node.js/Express Backend: ", "Construct an asynchronous, non-blocking HTTP server capable of parsing incoming requests, managing application state, and serving static resources."),
          createBulletItem("• Formulate a RESTful API: ", "Establish clear, resource-oriented REST endpoints conforming to standard HTTP verbs (GET, POST, PATCH, DELETE) for complete task lifecycle management."),
          createBulletItem("• Implement a Zero-Bloat Presentation Tier: ", "Build a modern, accessible user interface using semantic HTML5 and Vanilla CSS3 without relying on third-party CSS utility frameworks or client runtime libraries."),
          createBulletItem("• Establish Asynchronous Client-Server Synchronization: ", "Utilize modern JavaScript ES6+ features (async/await, Promises, Fetch API) to query the backend dynamically, update DOM nodes in real time, and handle network anomalies gracefully without full-page reloads."),
          createBulletItem("• Incorporate Production-Grade Workflow Logic: ", "Implement status progression (To Do, In Progress, Blocked, Completed) and structured validation to mirror real-world software project tracking tools."),

          createHeading2("1.4 Scope and Applicability"),
          createBodyPara(
            "The developed Task Manager is designed for local deployment and lightweight team or individual task tracking. It functions as an extensible reference architecture for full-stack client-server interaction. The project encompasses server routing, parameter validation, JSON serialization/deserialization, event-driven client updates, responsive design tokens, and modular code organization. While initially configured for single-tenant operations, the modular interface is architected to integrate seamlessly with persistent database engines and multi-user authentication mechanisms in future revisions."
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ----------------------------------------------------
          // CHAPTER 2
          // ----------------------------------------------------
          createHeading1("CHAPTER 2: SYSTEM REQUIREMENTS & TECHNOLOGY STACK"),
          createHeading2("2.1 Hardware Requirements"),
          createBodyPara(
            "The development and host environment requires modest computational specifications due to the lightweight, non-blocking characteristics of the Node.js runtime and native web APIs."
          ),
          createTable(
            ['Component', 'Minimum Specification', 'Recommended Specification'],
            [
              ['Processor', 'Intel Core i3 / AMD Ryzen 3 (Dual Core, 2.0 GHz)', 'Intel Core i5 / AMD Ryzen 5 or higher'],
              ['Primary Memory (RAM)', '4 GB DDR3/DDR4', '8 GB DDR4 or higher'],
              ['Secondary Storage', '200 MB free hard disk space', 'Solid State Drive (SSD) with 1 GB free'],
              ['Input Devices', 'Standard Keyboard, Mouse / Touchpad', 'Standard Keyboard, Mouse'],
              ['Display Resolution', '1024 × 768 pixels', '1920 × 1080 pixels (Full HD)']
            ],
            [2200, 3100, 3100]
          ),

          createHeading2("2.2 Software Requirements"),
          createBodyPara(
            "The project relies on standardized, cross-platform open-source tooling, eliminating proprietary runtime dependencies."
          ),
          createTable(
            ['Software Layer', 'Component / Tool', 'Version Utilized'],
            [
              ['Operating System', 'Windows / Linux / macOS', 'Windows 11 64-bit / Ubuntu 22.04 LTS'],
              ['Runtime Environment', 'Node.js', 'v20.x or higher (LTS release)'],
              ['Package Manager', 'Node Package Manager (npm)', 'v10.x / v12.x'],
              ['Backend Framework', 'Express.js', 'v5.x'],
              ['Web Browser', 'Google Chrome / Mozilla Firefox / MS Edge', 'Chromium v118+ / Firefox v115+'],
              ['Development Environment', 'Visual Studio Code / Modern IDE', 'Latest Stable Release']
            ],
            [2400, 3600, 2400]
          ),

          createHeading2("2.3 Technology Stack Justification"),
          createHeading3("2.3.1 Node.js and Express.js (Backend Runtime & Server)"),
          createBodyPara(
            "Asynchronous, Non-Blocking Event-Driven Model: Node.js executes on Google Chrome's V8 JavaScript engine. Its single-threaded, event-loop-driven concurrency model facilitates high I/O throughput without thread context-switching overhead. This architecture is optimal for handling concurrent HTTP requests and JSON data streaming."
          ),
          createBodyPara(
            "Express.js Framework: Express is selected as the server framework due to its minimalist, unopinionated structure. It introduces negligible overhead while providing foundational abstractions for routing tables, middleware pipelines (cors, express.json, express.static), and standardized request-response handling."
          ),

          createHeading3("2.3.2 HTML5 and Vanilla CSS3 (Presentation Layer)"),
          createBodyPara(
            "Semantic Markup: HTML5 elements (<header>, <main>, <section>, <nav>, <article>, <dialog>) ensure accessibility, semantic clarity, and clean DOM trees without superfluous container abstractions."
          ),
          createBodyPara(
            "Zero-Dependency Styling: Rather than using utility-first frameworks like Tailwind CSS or heavy CSS preprocessors, the application uses modern Vanilla CSS3 with CSS Custom Properties (Variables) for instant light/dark theme switching, fluid CSS Grid and Flexbox layouts, and restrained aesthetic tokens modeled after modern developer tools like Linear."
          ),

          createHeading3("2.3.3 Vanilla JavaScript and Fetch API (Client Logic)"),
          createBodyPara(
            "Elimination of Framework Bloat: By eschewing client-side meta-frameworks (e.g., React, Angular, Vue), the application avoids heavy bundle sizes, Virtual DOM reconciliation overhead, and build-time bundling toolchains."
          ),
          createBodyPara(
            "Native Fetch API & Event Delegation: Facilitates asynchronous, Promise-based network communication directly supported by modern browser engines, streamlining serialized JSON data transmission and updating DOM nodes efficiently."
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ----------------------------------------------------
          // CHAPTER 3
          // ----------------------------------------------------
          createHeading1("CHAPTER 3: SYSTEM DESIGN & ARCHITECTURE"),
          createHeading2("3.1 Client-Server Tier Architecture"),
          createBodyPara(
            "The system is architected around a classical two-tier Client-Server Architecture, adhering strictly to the Separation of Concerns (SoC) principle:"
          ),
          ...createCodeBlock([
            "+-------------------------------------------------------------+",
            "|                        CLIENT TIER                          |",
            "|  (Web Browser: HTML5, Vanilla CSS3, Vanilla JavaScript)     |",
            "|   +-------------------+              +------------------+   |",
            "|   |  DOM / UI View    | <----------> |  Event Handlers  |   |",
            "|   +-------------------+              +------------------+   |",
            "|                                                |            |",
            "|                                      +------------------+   |",
            "|                                      |  Fetch API Client|   |",
            "|                                      +------------------+   |",
            "+------------------------------------------------|------------+",
            "                       HTTP / JSON (REST API)    |",
            "                                                 v",
            "+-------------------------------------------------------------+",
            "|                        SERVER TIER                          |",
            "|               (Node.js Runtime / Express.js)                |",
            "|   +-------------------+              +------------------+   |",
            "|   | Static Asset Svc  |              | Express Router   |   |",
            "|   +-------------------+              +------------------+   |",
            "|                                                |            |",
            "|                                      +------------------+   |",
            "|                                      | Controller Logic |   |",
            "|                                      | & Data Validation|   |",
            "|                                      +------------------+   |",
            "|                                                |            |",
            "|                                      +------------------+   |",
            "|                                      | Storage Service  |   |",
            "|                                      +------------------+   |",
            "+-------------------------------------------------------------+"
          ]),

          createHeading2("3.2 RESTful API Design and Endpoint Specification"),
          createBodyPara(
            "The server exposes a stateless, resource-oriented REST interface. Operations map predictably to standard HTTP verbs."
          ),
          createTable(
            ['HTTP Method', 'Route Endpoint', 'Purpose / Functionality', 'Success Status', 'Payload / Parameters'],
            [
              ['GET', '/api/tasks', 'Retrieve tasks with optional filters', '200 OK', 'Query: status, project_id, search, sort'],
              ['POST', '/api/tasks', 'Create a new task entry', '201 Created', 'Body: { title, project_id, priority, ... }'],
              ['GET', '/api/tasks/:id', 'Retrieve detailed metadata for a task', '200 OK', 'URL Param: id (integer)'],
              ['PATCH', '/api/tasks/:id/status', 'Transition task workflow status', '200 OK', 'Body: { status: "completed" | ... }'],
              ['PATCH', '/api/tasks/:id', 'Update specified task attributes', '200 OK', 'Body: JSON object of modified fields'],
              ['DELETE', '/api/tasks/:id', 'Permanently remove a task entry', '200 OK', 'URL Param: id (integer)'],
              ['GET', '/api/projects', 'Fetch all project groups with metrics', '200 OK', 'None'],
              ['GET', '/api/stats', 'Retrieve global workspace metrics', '200 OK', 'None']
            ],
            [1200, 2000, 2200, 1200, 1800]
          ),

          createHeading2("3.3 End-to-End Data Flow"),
          createBodyPara(
            "The operational lifecycle of a client-initiated transaction proceeds through six deterministic stages:"
          ),
          createBulletItem("1. User Action: ", "The user enters a task title and clicks 'Add Task'."),
          createBulletItem("2. Client Validation: ", "Client-side scripts verify non-empty strings and format constraints."),
          createBulletItem("3. Asynchronous Dispatch: ", "The Fetch API dispatches an HTTP POST request carrying JSON payload."),
          createBulletItem("4. Server Ingestion: ", "Express middleware parses the body via express.json() and delivers it to the route controller."),
          createBulletItem("5. Storage Execution: ", "The controller verifies attributes, performs database insertion, and updates relational counters."),
          createBulletItem("6. Reactive DOM Mutation: ", "The server responds with HTTP 201 Created; the client prepends the new task row and updates progress counters in real time."),

          createHeading2("3.4 Data Integrity & State Management"),
          createBodyPara(
            "The system enforces strict data validation on both client and server boundaries:"
          ),
          createBulletItem("• String Sanitization: ", "Title inputs undergo whitespace trimming and length constraints (1 to 200 characters)."),
          createBulletItem("• Enumeration Constraints: ", "Workflow statuses are restricted to defined states: 'todo', 'in_progress', 'blocked', and 'completed'."),
          createBulletItem("• Relational Integrity: ", "Tasks map directly to valid project identifiers, ensuring tasks are never orphaned."),
          createBulletItem("• Idempotent Operations: ", "Resource deletion and retrieval operations maintain idempotency, returning standardized error codes (400 Bad Request, 404 Not Found, or 409 Conflict) when invalid operations are requested."),

          new Paragraph({ children: [new PageBreak()] }),

          // ----------------------------------------------------
          // CHAPTER 4
          // ----------------------------------------------------
          createHeading1("CHAPTER 4: IMPLEMENTATION & SOURCE CODE STRUCTURE"),
          createHeading2("4.1 Directory and File Structure"),
          createBodyPara(
            "The project adopts a modular directory structure separating backend server modules from public static client assets:"
          ),
          ...createCodeBlock([
            "internship-proj/",
            "|-- package.json                 # Dependency manifests, metadata, and scripts",
            "|-- server.js                    # Main server entrypoint, middleware, and route mounting",
            "|-- src/                         # Server-side source modules",
            "|   |-- db.js                    # Database connection, schemas, and relational constraints",
            "|   `-- routes/                  # Express sub-routers",
            "|       |-- tasks.js             # REST route handlers for task lifecycle management",
            "|       |-- projects.js          # REST route handlers for project workflow aggregation",
            "|       `-- categories.js        # REST route handlers for category tags and counters",
            "|-- public/                      # Static client assets (served by Express)",
            "|   |-- index.html               # Semantic single-page HTML interface",
            "|   |-- css/",
            "|   |   `-- style.css            # Custom CSS design system, layout grid, and themes",
            "|   `-- js/",
            "|       |-- api.js               # Asynchronous Fetch API abstraction wrapper",
            "|       `-- app.js               # Frontend controller, state store, and DOM renderer",
            "`-- data/                        # Persistent local database storage directory",
            "    `-- tasks.db                 # SQLite database storage file"
          ]),

          createHeading2("4.2 Backend Implementation Details"),
          createHeading3("4.2.1 Server Initialization and Middleware Setup (server.js)"),
          createBodyPara(
            "The application entrypoint initializes an Express server instance, registers critical middleware, mounts API routing pipelines, and serves public static resources:"
          ),
          ...createCodeBlock([
            "const express = require('express');",
            "const cors = require('cors');",
            "const path = require('path');",
            "const tasksRouter = require('./src/routes/tasks');",
            "const projectsRouter = require('./src/routes/projects');",
            "const categoriesRouter = require('./src/routes/categories');",
            "",
            "const app = express();",
            "const PORT = process.env.PORT || 3000;",
            "",
            "// Universal Middleware Pipeline",
            "app.use(cors());",
            "app.use(express.json());",
            "app.use(express.static(path.join(__dirname, 'public')));",
            "",
            "// Resource API Sub-Router Mounting",
            "app.use('/api/projects', projectsRouter);",
            "app.use('/api/tasks', tasksRouter);",
            "app.use('/api/categories', categoriesRouter);",
            "",
            "// Single Page Application Fallback Route",
            "app.use((req, res) => {",
            "  res.sendFile(path.join(__dirname, 'public', 'index.html'));",
            "});",
            "",
            "// Server Initialization",
            "app.listen(PORT, () => {",
            "  console.log(`TaskMaster Server running at: http://localhost:${PORT}`);",
            "});"
          ]),

          createHeading3("4.2.2 REST Route Handlers and Controller Logic (src/routes/tasks.js)"),
          createBodyPara(
            "Task routes implement input validation, status queries, and transactional updates:"
          ),
          ...createCodeBlock([
            "router.post('/', (req, res) => {",
            "  try {",
            "    let { project_id, title, description, priority, category_id, due_date, status } = req.body;",
            "",
            "    if (!title || typeof title !== 'string' || !title.trim()) {",
            "      return res.status(400).json({ success: false, error: 'Task title is required.' });",
            "    }",
            "    title = title.trim();",
            "",
            "    const insertStmt = db.prepare(`",
            "      INSERT INTO tasks (project_id, title, description, status, priority, category_id, due_date, created_at, updated_at)",
            "      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
            "    `);",
            "    const result = insertStmt.run(project_id, title, description, status || 'todo', priority || 'Medium', category_id, due_date);",
            "    const createdTask = getTaskDetails(Number(result.lastInsertRowid));",
            "",
            "    return res.status(201).json({ success: true, message: 'Task created successfully', data: createdTask });",
            "  } catch (error) {",
            "    console.error('Task creation failure:', error);",
            "    return res.status(500).json({ success: false, error: 'Internal Server Error' });",
            "  }",
            "});"
          ]),

          createHeading2("4.3 Frontend Implementation Details"),
          createHeading3("4.3.1 Semantic DOM Assembly (public/index.html)"),
          createBodyPara(
            "The user interface is declared using semantic tags that establish visual and accessible hierarchy: <header class=\"app-topbar\"> houses the application branding, project statistics pill, theme toggle, and trigger action buttons; <section class=\"project-header-panel\"> houses project navigation tabs and active progress bar metrics; and <div id=\"taskList\"> serves as the dynamic mount target for rendering server-persisted task rows."
          ),

          createHeading3("4.3.2 Asynchronous Fetch Wrapper (public/js/api.js)"),
          createBodyPara(
            "To decouple network transport logic from UI presentation, all network transactions are centralized in an asynchronous API client object:"
          ),
          ...createCodeBlock([
            "const API = {",
            "  baseUrl: '/api',",
            "  async request(endpoint, options = {}) {",
            "    const url = `${this.baseUrl}${endpoint}`;",
            "    const headers = { 'Content-Type': 'application/json', ...options.headers };",
            "    try {",
            "      const response = await fetch(url, { ...options, headers });",
            "      const data = await response.json().catch(() => ({}));",
            "      if (!response.ok) {",
            "        const error = new Error(data.error || `HTTP error ${response.status}`);",
            "        error.data = data;",
            "        error.status = response.status;",
            "        throw error;",
            "      }",
            "      return data;",
            "    } catch (error) {",
            "      console.error(`Network request failed on [${options.method || 'GET'} ${url}]:`, error);",
            "      throw error;",
            "    }",
            "  },",
            "  async getTasks(params = {}) {",
            "    const query = new URLSearchParams(params).toString();",
            "    return this.request(`/tasks${query ? '?' + query : ''}`);",
            "  },",
            "  async createTask(taskData) {",
            "    return this.request('/tasks', { method: 'POST', body: JSON.stringify(taskData) });",
            "  },",
            "  async updateTaskStatus(id, status) {",
            "    return this.request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });",
            "  },",
            "  async deleteTask(id) {",
            "    return this.request(`/tasks/${id}`, { method: 'DELETE' });",
            "  }",
            "};"
          ]),

          createHeading3("4.3.3 Event Delegation and Reactive State Sync (public/js/app.js)"),
          createBodyPara(
            "The application implements an in-memory client state store (state = { tasks: [], projects: [], filters: {} }). DOM mutation is managed via event delegation on parent containers rather than attaching discrete listeners to individual rows:"
          ),
          ...createCodeBlock([
            "el.taskList.addEventListener('click', async (e) => {",
            "  const row = e.target.closest('.task-row');",
            "  if (!row) return;",
            "",
            "  const taskId = parseInt(row.dataset.id, 10);",
            "  const cycleBtn = e.target.closest('[data-action=\"cycle-status\"]');",
            "",
            "  if (cycleBtn) {",
            "    const task = state.tasks.find(t => t.id === taskId);",
            "    let nextStatus = 'in_progress';",
            "    if (task.status === 'todo') nextStatus = 'in_progress';",
            "    else if (task.status === 'in_progress') nextStatus = 'completed';",
            "    else if (task.status === 'completed') nextStatus = 'todo';",
            "",
            "    try {",
            "      const res = await API.updateTaskStatus(taskId, nextStatus);",
            "      if (res.success) {",
            "        showToast(`Task #${taskId} updated to ${res.data.status}`, 'success');",
            "        await loadAllData(); // Synchronize local state with backend",
            "      }",
            "    } catch (err) {",
            "      showToast(err.message, 'warning');",
            "    }",
            "  }",
            "});"
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ----------------------------------------------------
          // CHAPTER 5
          // ----------------------------------------------------
          createHeading1("CHAPTER 5: TESTING AND RESULTS"),
          createHeading2("5.1 Test Methodology"),
          createBodyPara(
            "Testing was conducted systematically across multiple dimensions:"
          ),
          createBulletItem("1. API Functional Testing: ", "Validating endpoint status codes, header configurations, and payload contracts using programmatic HTTP test scripts."),
          createBulletItem("2. Boundary and Validation Testing: ", "Passing malformed inputs, empty string payloads, and invalid foreign keys to ensure server-side guards fail safely."),
          createBulletItem("3. Cross-Browser and Responsive Testing: ", "Verifying styling integrity and layout responsiveness across Chromium and Gecko browser engines across mobile and desktop breakpoints."),

          createHeading2("5.2 API Verification and Functional Test Cases"),
          createTable(
            ['Test ID', 'Test Scenario', 'HTTP Method & Route', 'Input Payload', 'Expected Response', 'Observed Result', 'Status'],
            [
              ['TC-01', 'Retrieve all tasks', 'GET /api/tasks', 'None', 'HTTP 200 OK, JSON array', 'Received tasks array', 'Pass'],
              ['TC-02', 'Add valid task', 'POST /api/tasks', '{"title":"Setup DB","project_id":1}', 'HTTP 201 Created, object', 'Task inserted, ID returned', 'Pass'],
              ['TC-03', 'Add task with empty title', 'POST /api/tasks', '{"title":""}', 'HTTP 400 Bad Request, error', 'Correctly rejected', 'Pass'],
              ['TC-04', 'Valid status change', 'PATCH /api/tasks/1/status', '{"status":"completed"}', 'HTTP 200 OK, updated', 'Status shifted to completed', 'Pass'],
              ['TC-05', 'Invalid status transition', 'PATCH /api/tasks/1/status', '{"status":"invalid_state"}', 'HTTP 400 Bad Request', 'Rejected with message', 'Pass'],
              ['TC-06', 'Delete existing task', 'DELETE /api/tasks/1', 'None', 'HTTP 200 OK, confirmation', 'Task removed from storage', 'Pass'],
              ['TC-07', 'Delete non-existent task', 'DELETE /api/tasks/999', 'None', 'HTTP 404 Not Found', 'Handled with 404 error', 'Pass'],
              ['TC-08', 'Project metrics computation', 'GET /api/projects', 'None', 'HTTP 200 OK, metrics', 'Percentages derived', 'Pass']
            ],
            [900, 1500, 1500, 1500, 1300, 1200, 700]
          ),

          createHeading2("5.3 User Interface Execution and Interaction Workflow"),
          createBodyPara(
            "1. Initial Load & Global Summary: Upon accessing http://localhost:3000, the application executes parallel Promise.all() calls fetching projects, categories, and tasks. The top navigation updates the global status summary pill (X/Y completed)."
          ),
          createBodyPara(
            "2. Project Context Switching: Selecting a project tab filters the workspace immediately. The progress bar recalibrates, displaying visual ratios for completed, in-progress, blocked, and to-do segments."
          ),
          createBodyPara(
            "3. Task Manipulation: Clicking 'New Task' launches a focused modal dialog. Upon form submission, the modal closes, a toast notification slides into view, and the task appears at the top of the list without a page refresh. Clicking the status badge advances the task state through the workflow pipeline, recalculating progress percentages instantly. Clicking the delete icon triggers a confirmation prompt; upon user validation, the record is purged."
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ----------------------------------------------------
          // CHAPTER 6
          // ----------------------------------------------------
          createHeading1("CHAPTER 6: CONCLUSION AND FUTURE SCOPE"),
          createHeading2("6.1 Academic and Technical Learning Outcomes"),
          createBodyPara(
            "The engineering of the Task Manager Web Application fulfilled all core learning objectives specified in the 3rd Semester Information Technology Internship-1 curriculum (R22A Regulation) at Chaitanya Bharathi Institute of Technology."
          ),
          createBodyPara(
            "Key technical and academic outcomes achieved through this project include:"
          ),
          createBulletItem("• Comprehensive Full-Stack Fluency: ", "Acquired practical proficiency in managing asynchronous client-server communication using HTTP protocols, REST architectural paradigms, and structured JSON serialization."),
          createBulletItem("• Mastery of Non-Blocking Architecture: ", "Understood the mechanics of Node.js event-driven processing, Express middleware chaining, and modular route structuring."),
          createBulletItem("• Standards-Compliant UI Engineering: ", "Developed an appreciation for Vanilla CSS3 design systems, responsive layout structures, and accessibility standards without relying on bloated third-party frameworks."),
          createBulletItem("• Defensive Programming & Validation: ", "Cultivated rigorous engineering practices regarding client- and server-side data sanitization, HTTP response code semantics, and error boundaries."),

          createHeading2("6.2 Future Enhancements"),
          createBodyPara(
            "While the current system satisfies all immediate academic and operational goals, several promising avenues exist for future technical extension:"
          ),
          createBulletItem("1. User Authentication and Authorization: ", "Implement token-based authentication (JSON Web Tokens - JWT) and password hashing via bcrypt to support secure multi-tenant user accounts and role-based access control (RBAC)."),
          createBulletItem("2. Real-Time Bidirectional Synchronization: ", "Integrate WebSocket protocols (e.g., Socket.io) to enable real-time collaboration, broadcasting task updates to multiple concurrent clients without polling."),
          createBulletItem("3. Cloud Native Containerization & CI/CD: ", "Package the full-stack application into a Docker container and configure a continuous integration and continuous deployment (CI/CD) pipeline for automated deployment on cloud platforms such as AWS ECS or Google Cloud Run."),
          createBulletItem("4. Offline PWA Capabilities: ", "Implement Service Workers and Cache Storage APIs to transform the web app into a Progressive Web App (PWA) capable of offline queuing and synchronization."),

          new Paragraph({ children: [new PageBreak()] }),

          // ----------------------------------------------------
          // REFERENCES
          // ----------------------------------------------------
          createHeading1("REFERENCES"),
          createBodyPara("1. Flanagan, D. (2020). JavaScript: The Definitive Guide: Master the World's Most-Used Programming Language (7th ed.). O'Reilly Media."),
          createBodyPara("2. Haverbeke, M. (2018). Eloquent JavaScript: A Modern Introduction to Programming (3rd ed.). No Starch Press."),
          createBodyPara("3. Casciaro, M., & Mammino, L. (2020). Node.js Design Patterns: Design and implement production-grade Node.js applications (3rd ed.). Packt Publishing."),
          createBodyPara("4. Mozilla Developer Network (MDN) Web Docs. Working with the Fetch API and Asynchronous JavaScript. Available online: https://developer.mozilla.org/"),
          createBodyPara("5. Express.js Technical Documentation. Express 5.x API Reference and Routing Guide. Available online: https://expressjs.com/"),
          createBodyPara("6. Fielding, R. T. (2000). Architectural Styles and the Design of Network-based Software Architectures (Doctoral dissertation). University of California, Irvine."),
          createBodyPara("7. Chaitanya Bharathi Institute of Technology (A). Curriculum and Syllabus Book for B.E. Information Technology (R22A Regulation). CBIT Autonomous Academic Regulations, Hyderabad.")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'Task_Manager_Internship_Report_Ronak_Sarda.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Report successfully generated at: ${outputPath}`);
}

buildDocument().catch(err => {
  console.error('Error generating docx report:', err);
  process.exit(1);
});
