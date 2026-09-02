export const RhetoricalTemplates = {
  empiricalAnomaly: {
    name: "Empirical Anomaly",
    description: "Focus on an outlier or unexpected data point.",
    structure: [
      "Establish the expected baseline (the norm).",
      "Highlight the anomaly (the outlier).",
      "Propose potential root causes for the anomaly."
    ],
    socraticPrompt: "I've identified a significant outlier here. Should our narrative focus on investigating *why* this outlier exists, or should we contrast it against the baseline average?"
  },
  comparativeDrift: {
    name: "Comparative Drift",
    description: "Compare two cohorts or time periods to show divergence.",
    structure: [
      "Establish the shared starting point or similarity.",
      "Show the point of divergence or difference.",
      "Synthesize the implications of this gap."
    ],
    socraticPrompt: "These two groups diverge significantly. Would you like to explore the historical context behind this split, or focus purely on the current impact?"
  },
  dialecticSynthesis: {
    name: "Dialectic Synthesis",
    description: "Present two opposing viewpoints and resolve them with data.",
    structure: [
      "Thesis: The first observation or argument.",
      "Antithesis: The conflicting observation or argument.",
      "Synthesis: How the data resolves or reframes the conflict."
    ],
    socraticPrompt: "The data presents two conflicting trends. Should we frame this as a contradiction, or try to synthesize a broader rule that explains both?"
  },
  rootCauseTrace: {
    name: "Root-Cause Trace",
    description: "Trace an outcome backwards to its primary driving factor.",
    structure: [
      "State the primary outcome or effect.",
      "Eliminate secondary variables.",
      "Isolate the root cause driver."
    ],
    socraticPrompt: "This outcome seems heavily driven by one variable. Do you want to drill down into that specific variable, or look at how other minor factors contribute?"
  }
};

export function getRandomRhetoric(): typeof RhetoricalTemplates[keyof typeof RhetoricalTemplates] {
  const keys = Object.keys(RhetoricalTemplates) as Array<keyof typeof RhetoricalTemplates>;
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return RhetoricalTemplates[randomKey];
}
