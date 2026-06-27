import { vi } from "vitest";

// 컴포넌트 단위 테스트용 next/navigation 스텁(앱 라우터 미마운트 환경).
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => "/",
}));
