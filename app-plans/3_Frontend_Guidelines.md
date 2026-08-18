# 3. Frontend Guidelines — Technical Implementation Standards

This document defines the coding conventions, folder structures, state management patterns, and quality standards for both the **Citizen Mobile App** (React Native / Expo) and the **Authority Web Dashboard** (Next.js).

---

## Part A: Citizen Mobile App (React Native / Expo)

### 1. Project Folder Structure

```
mobile-app/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout (theme provider, font loader)
│   ├── index.tsx                 # Splash screen
│   ├── onboarding.tsx            # Onboarding slides
│   ├── (auth)/
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── login.tsx
│   │   └── otp.tsx
│   ├── (tabs)/                   # Main tab navigator (after login)
│   │   ├── _layout.tsx           # Tab bar layout
│   │   ├── home.tsx              # Home / Map view
│   │   ├── profile.tsx           # Profile / Credits / Leaderboard
│   │   └── history.tsx           # My Reports list
│   ├── camera.tsx                # Camera capture (full screen, no tabs)
│   ├── review.tsx                # Review & Submit
│   ├── complaint/
│   │   └── [id].tsx              # Complaint Detail (dynamic route)
│   ├── verify/
│   │   └── [id].tsx              # Verify Resolution
│   └── dispute/
│       └── [id].tsx              # Dispute Merge
├── src/
│   ├── components/               # Shared UI components
│   │   ├── ui/                   # Atomic design primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── BottomSheet.tsx
│   │   ├── map/                  # Map-specific components
│   │   │   ├── ComplaintPin.tsx
│   │   │   ├── UserLocationDot.tsx
│   │   │   └── MapView.tsx
│   │   ├── complaint/            # Complaint-related components
│   │   │   ├── StatusTimeline.tsx
│   │   │   ├── AIAnalysisCard.tsx
│   │   │   ├── SizeEstimatePicker.tsx
│   │   │   └── DedupComparison.tsx
│   │   └── profile/
│   │       ├── CreditsSummary.tsx
│   │       └── LeaderboardList.tsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Auth state, login/logout, token refresh
│   │   ├── useLocation.ts       # GPS tracking, permission handling
│   │   ├── useComplaints.ts     # Complaint CRUD operations
│   │   ├── useCamera.ts         # Camera permission, capture logic
│   │   └── useNotifications.ts  # Push notification registration
│   ├── services/                 # API communication layer
│   │   ├── api.ts               # Axios instance with interceptors (JWT, base URL)
│   │   ├── auth.service.ts      # Login, OTP, token refresh
│   │   ├── complaint.service.ts # Submit, fetch, upvote, verify, dispute
│   │   └── storage.service.ts   # Photo upload to Supabase Storage
│   ├── stores/                   # Zustand state management
│   │   ├── auth.store.ts        # User session, JWT, role
│   │   ├── complaint.store.ts   # Active complaints, filters, selected
│   │   └── ui.store.ts          # Loading states, toast queue, bottom sheet
│   ├── theme/                    # Design system tokens
│   │   ├── colors.ts            # All color tokens from Design Guidelines
│   │   ├── typography.ts        # Font sizes, weights, line heights
│   │   ├── spacing.ts           # Spacing scale (4px base)
│   │   └── shadows.ts           # Box shadow presets
│   ├── utils/                    # Pure utility functions
│   │   ├── formatters.ts        # Date formatting, distance display, etc.
│   │   ├── validators.ts        # Phone number, GPS coordinate validation
│   │   └── constants.ts         # API URLs, rate limit values, enums
│   └── types/                    # TypeScript type definitions
│       ├── complaint.ts         # Complaint, AIAnalysis, Status enums
│       ├── user.ts              # User, Role enums
│       └── api.ts               # API request/response shapes
├── assets/                       # Static assets
│   ├── fonts/
│   │   ├── Philosopher-Regular.ttf
│   │   ├── Philosopher-Bold.ttf
│   │   ├── Philosopher-Italic.ttf
│   │   ├── Philosopher-BoldItalic.ttf
│   │   ├── Inter-Regular.ttf     # Secondary font (captions, badges)
│   │   └── Inter-Bold.ttf
│   ├── images/
│   │   ├── logo.png
│   │   ├── onboarding-1.png
│   │   ├── onboarding-2.png
│   │   └── onboarding-3.png
│   └── animations/              # Lottie animations (optional)
│       └── success-check.json
├── .env.example
├── app.json                      # Expo config
├── tsconfig.json
├── babel.config.js
└── package.json
```

### 2. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Components | PascalCase | `StatusTimeline.tsx`, `AIAnalysisCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useLocation.ts` |
| Services | camelCase with `.service` suffix | `complaint.service.ts` |
| Stores | camelCase with `.store` suffix | `auth.store.ts` |
| Types | PascalCase | `Complaint`, `UserRole`, `SeverityLevel` |
| Constants | UPPER_SNAKE_CASE | `MAX_DAILY_SUBMISSIONS`, `API_BASE_URL` |
| Screen files | kebab-case (Expo Router convention) | `home.tsx`, `[id].tsx` |
| Style objects | camelCase | `containerStyle`, `headerText` |

### 3. Component Guidelines

#### Component Template
Every component should follow this structure:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, styles[status], size === 'sm' && styles.small]}>
      <Text style={[styles.label, { color: statusColors[status] }]}>
        {status.replace('_', ' ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
  },
  label: {
    fontFamily: 'Inter-Bold', // Inter for tiny UI text (< 13px)
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  small: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  // ... status-specific background colors
});
```

#### Rules
1. **Named exports only** — no default exports. This ensures consistent import naming.
2. **Props interface required** — every component must define a typed props interface, even if it has no props (`interface Props {}`).
3. **StyleSheet.create over inline styles** — StyleSheet.create is memoized and more performant. Inline styles only for dynamic values.
4. **No magic numbers** — all colors, sizes, and spacing must reference theme tokens.
5. **One component per file** — exceptions: very small helper components used only within the same file.

### 4. State Management (Zustand)

#### Store Template
```tsx
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Actions
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (phone, otp) => {
    set({ isLoading: true });
    try {
      const response = await authService.verifyOtp(phone, otp);
      set({ user: response.user, token: response.token, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, token: null });
  },

  refreshToken: async () => {
    // Token refresh logic
  },
}));
```

#### Rules
1. **Zustand over React Context** for global state. Context causes re-renders on every consumer; Zustand subscriptions are granular.
2. **One store per domain** — `auth.store`, `complaint.store`, `ui.store`. Do NOT create one giant store.
3. **Selectors for performance** — always use selectors to subscribe to specific slices:
   ```tsx
   // ✅ Good — only re-renders when `user` changes
   const user = useAuthStore((state) => state.user);
   
   // ❌ Bad — re-renders on ANY store change
   const { user } = useAuthStore();
   ```
4. **Async actions inside the store** — keep components thin. Components call `store.login()`, not raw API calls.

### 5. API Communication Layer

#### Axios Instance (`api.ts`)
```tsx
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { API_BASE_URL } from '@/utils/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 (token expired) globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

#### Rules
1. **Services wrap axios** — components never call `api.get(...)` directly. They call `complaintService.submit(...)`.
2. **Type all responses** — every service function returns a typed Promise.
3. **Error handling in services** — services transform API errors into user-friendly error objects. Components display them.

### 6. Offline Support (WatermelonDB)

WatermelonDB caches complaint data locally for offline-first behavior:
* **When online:** Fetch from API → cache in WatermelonDB → render from cache.
* **When offline:** Render from cache. Queue submissions locally. Sync when back online.
* **Sync strategy:** Pull from API on app foreground. Push queued submissions on reconnect.

### 7. Testing Strategy (Mobile)

| Type | Tool | What to Test |
|---|---|---|
| Unit tests | Jest | Utility functions, formatters, validators |
| Component tests | React Native Testing Library | Component rendering, user interactions |
| Store tests | Jest | Zustand store actions, state transitions |
| E2E tests (Sprint 6) | Detox | Full user flows on real device |

---

## Part B: Authority Web Dashboard (Next.js)

### 1. Project Folder Structure

```
web-dashboard/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (theme, font, sidebar)
│   │   ├── page.tsx              # Dashboard home (GIS Map)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── triage/
│   │   │   └── page.tsx          # Triage list
│   │   ├── complaints/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Complaint detail
│   │   ├── dedup-review/
│   │   │   └── page.tsx          # Dedup review panel
│   │   ├── analytics/
│   │   │   └── page.tsx          # Analytics dashboards
│   │   └── crews/
│   │       └── page.tsx          # Crew management
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (customized)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── toast.tsx
│   │   ├── map/
│   │   │   ├── DashboardMap.tsx
│   │   │   ├── ComplaintCluster.tsx
│   │   │   ├── CrewMarker.tsx
│   │   │   └── HeatmapLayer.tsx
│   │   ├── complaint/
│   │   │   ├── ComplaintCard.tsx
│   │   │   ├── SeverityExplainer.tsx
│   │   │   ├── StatusTimeline.tsx
│   │   │   └── DedupCompare.tsx
│   │   ├── dispatch/
│   │   │   └── DispatchModal.tsx
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       ├── TopBar.tsx
│   │       └── ActivityFeed.tsx
│   ├── hooks/
│   │   ├── useSocket.ts          # Socket.IO connection & event listeners
│   │   ├── useComplaints.ts     # TanStack Query hooks for complaint data
│   │   └── useMap.ts            # Map state, viewport, layers
│   ├── services/
│   │   ├── api.ts               # Axios instance (same pattern as mobile)
│   │   ├── authority.service.ts # Dispatch, dedup review, triage
│   │   └── analytics.service.ts # Ward stats, SLA data
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── map.store.ts         # Viewport, active layers, selected pin
│   │   └── ui.store.ts
│   ├── lib/
│   │   ├── socket.ts            # Socket.IO client singleton
│   │   └── utils.ts             # cn() helper, formatters
│   ├── theme/
│   │   └── colors.ts            # Same color tokens as mobile
│   └── types/
│       ├── complaint.ts         # Shared types (ideally symlinked or copied from a shared package)
│       └── authority.ts         # Dispatch, Crew, DedupReview types
├── public/
│   └── logo.svg
├── tailwind.config.ts            # Tailwind config with Ellipse color tokens
├── .env.example
├── next.config.js
├── tsconfig.json
└── package.json
```

### 2. Tailwind Configuration (Ellipse Theme)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#E3EF26',
          muted: '#B8C41E',
        },
        teal: {
          DEFAULT: '#076653',
          light: '#0A8A72',
        },
        forest: {
          DEFAULT: '#0C342C',
          midnight: '#061F1A',
          surface: '#0F3D33',
          elevated: '#134A3E',
        },
        severity: {
          critical: '#FF4D4D',
          moderate: '#FF9F43',
          low: '#FECA57',
          resolved: '#2ED573',
        },
        info: '#54A0FF',
      },
      fontFamily: {
        serif: ['Philosopher', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### 3. Data Fetching (TanStack Query)

```tsx
// hooks/useComplaints.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorityService } from '@/services/authority.service';

export function useTriageComplaints(filters: TriageFilters) {
  return useQuery({
    queryKey: ['complaints', 'triage', filters],
    queryFn: () => authorityService.getTriageList(filters),
    refetchInterval: 30_000, // Re-fetch every 30 seconds
  });
}

export function useDispatchCrew() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authorityService.dispatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}
```

#### Rules
1. **TanStack Query for server state** — all API data fetching uses `useQuery` and `useMutation`. No `useEffect` + `useState` for API calls.
2. **Zustand for client-only state** — map viewport, sidebar collapse, selected filters. Not API data.
3. **Query key conventions:** `['resource', 'sub-resource', filters]` — e.g., `['complaints', 'triage', { ward: 'W5' }]`.

### 4. Real-Time Updates (Socket.IO)

```tsx
// lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token: useAuthStore.getState().token },
      transports: ['websocket'],
    });
  }
  return socket;
}
```

```tsx
// hooks/useSocket.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';

export function useSocketEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    socket.on('complaint_triaged', (data) => {
      // Invalidate the triage list so TanStack Query re-fetches
      queryClient.invalidateQueries({ queryKey: ['complaints', 'triage'] });
    });

    socket.on('dedup_review_needed', (data) => {
      queryClient.invalidateQueries({ queryKey: ['dedup-reviews'] });
    });

    return () => {
      socket.off('complaint_triaged');
      socket.off('dedup_review_needed');
    };
  }, [queryClient]);
}
```

### 5. Web Dashboard Testing Strategy

| Type | Tool | What to Test |
|---|---|---|
| Unit tests | Vitest | Utility functions, service transforms |
| Component tests | Vitest + Testing Library | Component rendering, interactions |
| E2E tests (Sprint 6) | Playwright | Full dashboard flows (login → triage → dispatch) |

---

## Part C: Shared Standards (Both Platforms)

### 1. TypeScript Strictness
```json
// tsconfig.json (both projects)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 2. Import Path Aliases
Both projects use `@/` as the root alias:
```tsx
// ✅ Good
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';

// ❌ Bad
import { Button } from '../../../components/ui/Button';
```

### 3. Error Handling Pattern
```tsx
// Every service function follows this pattern:
export async function submitComplaint(data: SubmitComplaintInput): Promise<SubmitComplaintResult> {
  try {
    const response = await api.post('/citizen/complaints', data);
    return { success: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 409) return { success: false, error: 'DUPLICATE', data: error.response.data };
      if (status === 429) return { success: false, error: 'RATE_LIMITED' };
      if (status === 422) return { success: false, error: 'VALIDATION', message: error.response.data.message };
    }
    return { success: false, error: 'UNKNOWN' };
  }
}
```
Components check `result.success` and display the appropriate UI (error toast, duplicate modal, etc.) — they never catch raw API errors.

### 4. Git Commit Convention
```
feat: add camera capture screen with blur detection
fix: complaint pin color not matching severity on map
refactor: extract StatusBadge into reusable component
style: apply Gradient 3 to onboarding slides
chore: update expo-camera to v15
docs: add offline sync flow to app-plans
```

### 5. Performance Targets

| Metric | Mobile | Web Dashboard |
|---|---|---|
| App launch to interactive | < 3 seconds | < 2 seconds (TTFB) |
| Camera to photo captured | < 1 second | N/A |
| Complaint submission (network) | < 2 seconds (P95) | N/A |
| Map render (100 pins) | 60 FPS | 60 FPS |
| Bundle size | < 25 MB (APK) | < 500 KB (initial JS) |
| Lighthouse Performance | N/A | > 90 |
