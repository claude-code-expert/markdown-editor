import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// 파일시스템 접근 필요 → Node 런타임 강제(Edge 불가)
export const runtime = "nodejs";

const ILLEGAL = /[\\/:*?"<>|]/g; // OS 파일명 금지문자

/** 경로 세그먼트 안전화 — 구분자(../)·금지문자·후행 점 제거. 빈 값이면 fallback. */
function safeSegment(name: string, fallback: string): string {
  const base = path
    .basename(name)
    .replace(ILLEGAL, "")
    .replace(/\.+$/, "")
    .trim();
  return base || fallback;
}

/**
 * POST /api/save — 현재 마크다운을 프로젝트 `resource/md/<폴더>/<제목>.md`로 기록.
 * 폴더별 하위 디렉터리로 분리해 동명 문서 충돌 방지. 저장 버튼이 IndexedDB 저장과 함께 호출.
 * 로컬 dev 도구 용도(서버 fs 쓰기).
 */
export async function POST(req: Request) {
  try {
    const { title, content, folder } = await req.json();
    if (typeof content !== "string") {
      return NextResponse.json(
        { ok: false, error: "content가 문자열이 아닙니다" },
        { status: 400 },
      );
    }

    const root = path.join(process.cwd(), "resource", "md");
    const folderSeg = safeSegment(typeof folder === "string" ? folder : "", "기타");
    const dir = path.join(root, folderSeg);

    const fileName =
      safeSegment(typeof title === "string" ? title : "", "제목 없음") + ".md";
    const target = path.join(dir, fileName);

    // 최종 경로가 resource/md 밖이면 거부(path traversal 이중 방어)
    if (!dir.startsWith(root + path.sep) || !target.startsWith(dir + path.sep)) {
      return NextResponse.json({ ok: false, error: "잘못된 경로" }, { status: 400 });
    }

    await mkdir(dir, { recursive: true });

    await writeFile(target, content, "utf8");
    return NextResponse.json({
      ok: true,
      path: path.relative(process.cwd(), target),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "파일 저장 실패" },
      { status: 500 },
    );
  }
}
