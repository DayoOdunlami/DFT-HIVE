/**
 * GA4 analytics helpers for HIVE handbook.
 * All events are no-ops when window.gtag is not available (server-side, no key).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function track(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

export const ga4 = {
  /** User performed a keyword search */
  searchPerformed(query: string, resultCount: number, source: "ai" | "keyword") {
    track("search_performed", {
      search_term: query,
      result_count: resultCount,
      intent_source: source,
    });
  },

  /** User applied a filter pill (hazard or sector) */
  filterApplied(filterType: "hazard" | "sector", filterValue: string) {
    track("filter_applied", {
      filter_type: filterType,
      filter_value: filterValue,
    });
  },

  /** User opened a case study deep-dive page */
  caseStudyOpened(caseId: string, sector: string, via: "card" | "chip" | "marquee") {
    track("case_study_opened", {
      case_id: caseId,
      transport_sector: sector,
      open_via: via,
    });
  },

  /** User added a case to their brief */
  addedToBrief(caseId: string, briefSize: number) {
    track("added_to_brief", {
      case_id: caseId,
      brief_size: briefSize,
    });
  },

  /** User generated a brief from filtered results */
  briefGenerated(caseIds: string[], source: "synthesis_panel" | "brief_page") {
    track("brief_generated", {
      case_count: caseIds.length,
      case_ids: caseIds.join(","),
      brief_source: source,
    });
  },

  /** User triggered PDF export */
  pdfDownloaded(caseIds: string[]) {
    track("pdf_downloaded", {
      case_count: caseIds.length,
      case_ids: caseIds.join(","),
    });
  },

  /** User opened the chat panel */
  chatOpened(context: string) {
    track("chat_opened", { chat_context: context });
  },

  /** User clicked a heatmap cell */
  heatmapClicked(sector: string, hazard: string, variant: "landing" | "filter") {
    track("heatmap_clicked", {
      transport_sector: sector,
      climate_hazard: hazard,
      heatmap_variant: variant,
    });
  },
};
