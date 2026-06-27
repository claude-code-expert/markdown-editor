interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

/** 스크롤 가능 여부 (Y3) */
export function canScroll(el: Pick<ScrollMetrics, "scrollHeight" | "clientHeight">): boolean {
  return el.scrollHeight - el.clientHeight > 0;
}

/** 스크롤 비율 0~1 (Y1). 분모 0 이하면 0. */
export function scrollRatio(el: ScrollMetrics): number {
  const max = el.scrollHeight - el.clientHeight;
  if (max <= 0) return 0;
  return el.scrollTop / max;
}

/** 비율 → 목표 scrollTop (Y2) */
export function targetScrollTop(
  ratio: number,
  el: Pick<ScrollMetrics, "scrollHeight" | "clientHeight">,
): number {
  const max = el.scrollHeight - el.clientHeight;
  return ratio * Math.max(0, max);
}

/**
 * 두 스크롤 엘리먼트 양방향 비례 동기화 (Y6~Y8).
 * lock + rAF로 프로그램적 스크롤이 되쏘는 피드백 루프 차단(Y7). 스크롤 불가 영역은 건너뜀(Y8).
 * 정리 함수 반환.
 */
export function syncScroll(a: HTMLElement, b: HTMLElement): () => void {
  let lock = false;

  const link = (src: HTMLElement, dst: HTMLElement) => () => {
    if (lock) return;
    if (!canScroll(dst)) return;
    lock = true;
    dst.scrollTop = targetScrollTop(scrollRatio(src), dst);
    requestAnimationFrame(() => {
      lock = false;
    });
  };

  const onA = link(a, b);
  const onB = link(b, a);
  a.addEventListener("scroll", onA, { passive: true });
  b.addEventListener("scroll", onB, { passive: true });

  return () => {
    a.removeEventListener("scroll", onA);
    b.removeEventListener("scroll", onB);
  };
}
