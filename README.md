# FACT CHECKER-AI

## Introduction

FACT CHECKER-AI is a comprehensive, AI-powered web application designed to combat the spread of misinformation. It provides users with a suite of powerful tools to verify textual claims, analyze images for authenticity, detect logical fallacies in arguments, and trace the origins and spread of misinformation campaigns. By leveraging Google's advanced Gemini models through the Genkit framework, the application delivers nuanced, evidence-based analysis in a clear and accessible user interface.

---

## Problem Statement

In the digital age, misinformation and disinformation spread rapidly across social media, news outlets, and other platforms. It has become increasingly difficult for the average person to distinguish between factual information and fabricated content. This challenge is compounded by sophisticated techniques like digital image manipulation and the use of rhetorical tricks to create misleading arguments. There is a pressing need for accessible tools that can help users critically evaluate the information they encounter online.

---

## Our Solution

FACT CHECKER-AI addresses this problem by providing a centralized platform for multi-faceted information analysis. Instead of just giving a simple true/false verdict, it offers a holistic view of a claim, including:

-   **Evidence-Based Verdicts:** Cross-referencing claims against reliable sources to determine their validity.
-   **Confidence Scoring:** Providing a quantitative measure of the AI's confidence in its verdict, along with reasoning.
-   **Contextual Explanations:** Offering neutral, background information to help users understand the broader topic.
-   **Source Transparency:** Listing the sources used for verification to encourage further investigation.
-   **Advanced Analysis:** Going beyond simple fact-checking to analyze rhetorical soundness and trace the propagation of information.

The application is built on a modern, robust tech stack, ensuring a responsive and reliable user experience.

---

## Core Features

### 1. Multi-Modal Fact-Checking
Users can submit claims for verification through multiple input methods.
-   **Text Input:** Enter any statement, claim, or question to receive a detailed fact-check report.
-   **Image Input:** Upload an image and provide a related query (e.g., "Is this a real photo of a shark on a highway?"). The AI analyzes both the image content and the textual claim.
-   **Voice Input:** Speak a claim directly into the application. The audio is transcribed to text and then submitted for fact-checking.

### 2. Comprehensive Verdict Reports
For each fact-check, the application generates a detailed card that includes:
-   **Verdict:** A clear `TRUE` or `FAKE` determination.
-   **Confidence Score:** A percentage (0-100%) indicating the AI's confidence, with a color-coded progress bar.
-   **Confidence Reasoning:** A brief explanation of why the score was given.
-   **Image Manipulation Analysis:** For image checks, this section determines if the image appears digitally altered or AI-generated, providing a separate confidence score and reasoning.
-   **Contextual Details:** If applicable, the report identifies *when* and *where* the claim is true.
-   **Further Explanation:** An expandable section provides a neutral, encyclopedic overview of the topic.
-   **Verifiable Sources:** A list of URLs and summaries of the sources used in the analysis.

### 3. Logical Fallacy Analysis
This tool helps users identify manipulative rhetoric.
-   **Input:** Users can submit a block of text, such as an opinion piece, a speech, or an argument.
-   **Output:** The AI identifies any logical fallacies (e.g., Ad Hominem, Straw Man, Red Herring), provides the specific excerpt where the fallacy occurred, and explains why it is considered fallacious.

### 4. Misinformation Source Tracing
This feature visualizes the spread of a misinformation claim.
-   **Input:** Users enter a known misinformation claim.
-   **Output:** The AI generates a network graph showing the likely origin of the claim and how it was amplified by other sources (e.g., news outlets, social media). The report includes a narrative summary and a list of identified nodes and links in the network.

---

## Technology and Architecture

### Frontend
-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **UI Library:** ShadCN UI
-   **Styling:** Tailwind CSS
-   **State Management:** React Hooks (`useState`, `useTransition`)

### Backend & AI
-   **AI Framework:** **Genkit**, a TypeScript-native framework for building production-ready AI applications.
-   **AI Models:** **Google's Gemini family of models** are used for their powerful multi-modal reasoning, function calling, and structured data generation capabilities.

### Key Logic & Algorithms

The core of the application's intelligence resides in the Genkit **Flows** located in the `src/ai/flows/` directory.

1.  **Structured I/O with Zod:** Each flow defines its expected input and output structure using Zod schemas. This ensures type safety and allows the AI model to generate perfectly formatted JSON data that the application can reliably parse and display.

2.  **Prompt Engineering:** The prompts for each flow are carefully engineered to instruct the Gemini model on its role (e.g., "You are a fact-checking expert"), the steps to take, the sources to prioritize, and the exact format for the output JSON.

3.  **Server Actions:** The Next.js frontend communicates with the backend AI logic via **Server Actions** (`src/app/actions.ts`). When a user submits a request:
    -   The UI component calls a Server Action (e.g., `checkFact`).
    -   The Server Action imports and invokes the corresponding Genkit flow function (e.g., `generateFactCheckVerdict`).
    -   The Genkit flow executes the prompt with the user's input.
    -   The AI model processes the request and returns the structured JSON data.
    -   The Server Action returns this data to the UI, which then updates its state to display the results.

This architecture leverages the strengths of the Next.js App Router by keeping server-side logic (AI calls) cleanly separated from the client-side UI, resulting in a performant and maintainable application.

---

## Project Files Overview

-   **/src/app/page.tsx**: The main entry point and primary user interface component. It manages application state, handles user input, and renders all other components.
-   **/src/app/actions.ts**: Contains all the Next.js Server Actions that act as the bridge between the frontend UI and the backend Genkit AI flows.
-   **/src/components/**: Contains all reusable React components, such as `VerdictCard.tsx`, `SourceGraphCard.tsx`, and the UI elements from ShadCN.
-   **/src/ai/genkit.ts**: Initializes and configures the global Genkit `ai` instance with the Google AI plugin.
-   **/src/ai/flows/**: This directory contains the "brains" of the application. Each file defines a specific AI capability:
    -   `generate-fact-check-verdict.ts`: Handles text-based fact-checking.
    -   `fact-check-image-and-text.ts`: Manages multi-modal (image + text) analysis.
    -   `analyze-text-for-fallacies.ts`: Identifies logical fallacies.
    -   `trace-misinformation-source.ts`: Traces the origin and spread of claims.
    -   `speech-to-text.ts`: Transcribes user-spoken audio.
-   **/public/**: Contains static assets.
-   **/src/app/globals.css**: Defines the global styles and Tailwind CSS theme variables for the application.
