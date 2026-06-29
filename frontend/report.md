# Frontend Codebase Report

This report documents all files, functions, and exports under `frontend/src`.

## Table of Contents

- [components](#components)
  - [components/Button.tsx](#componentsButtontsx)
  - [components/Chip.tsx](#componentsChiptsx)
  - [components/ErrorBoundary.tsx](#componentsErrorBoundarytsx)
  - [components/Footer.tsx](#componentsFootertsx)
  - [components/GoalCard.tsx](#componentsGoalCardtsx)
  - [components/HabitItem.tsx](#componentsHabitItemtsx)
  - [components/Marquee.tsx](#componentsMarqueetsx)
  - [components/Navbar.tsx](#componentsNavbartsx)
  - [components/Particles.tsx](#componentsParticlestsx)
  - [components/ProtectedRoute.tsx](#componentsProtectedRoutetsx)
  - [components/RecommendationCard.tsx](#componentsRecommendationCardtsx)
  - [components/RiskBadge.tsx](#componentsRiskBadgetsx)
  - [components/SideNav.tsx](#componentsSideNavtsx)
  - [components/SourceBadge.tsx](#componentsSourceBadgetsx)
  - [components/Toggle.tsx](#componentsToggletsx)
- [context](#context)
  - [context/AuthContext.tsx](#contextAuthContexttsx)
- [hooks](#hooks)
  - [hooks/useDashboardData.ts](#hooksuseDashboardDatats)
  - [hooks/useGoalsAndHabits.ts](#hooksuseGoalsAndHabitsts)
  - [hooks/useRecommendations.ts](#hooksuseRecommendationsts)
  - [hooks/useUserSettings.ts](#hooksuseUserSettingsts)
- [lib](#lib)
  - [lib/apiClient.ts](#libapiClientts)
  - [lib/firebase.ts](#libfirebasets)
- [pages](#pages)
  - [pages/Assistant.tsx](#pagesAssistanttsx)
  - [pages/Auth.tsx](#pagesAuthtsx)
  - [pages/Calendar.tsx](#pagesCalendartsx)
  - [pages/Dashboard.tsx](#pagesDashboardtsx)
  - [pages/Focus.tsx](#pagesFocustsx)
  - [pages/Landing.tsx](#pagesLandingtsx)
  - [pages/Settings.tsx](#pagesSettingstsx)
  - [pages/Tasks.tsx](#pagesTaskstsx)
- [Root](#root)
  - [App.tsx](#Apptsx)
  - [index.css](#indexcss)
  - [main.tsx](#maintsx)

---

## components

### components/Button.tsx
<a id="componentsButtontsx"></a>

**Path:** `frontend/src/components/Button.tsx`

**Description:** Component in components module.

#### Arrow Function: `Button`
- **Purpose:** Exported or module-level variable `Button`.
- **Snippet:**
```typescript
10: export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
11:   const baseClasses = 'font-label-mono text-label-mono px-6 py-3 uppercase rounded-full w-full flex items-center justify-center gap-2 transition-all';
12:   
13:   const variants = {
```

### components/Chip.tsx
<a id="componentsChiptsx"></a>

**Path:** `frontend/src/components/Chip.tsx`

**Description:** Component in components module.

#### Arrow Function: `Chip`
- **Purpose:** Exported or module-level variable `Chip`.
- **Snippet:**
```typescript
9: export const Chip: React.FC<ChipProps> = ({ label, active = false, onClick }) => {
10:   const activeClasses = 'bg-on-background text-background border-on-background';
11:   const inactiveClasses = 'bg-surface text-on-background border-on-background hover:bg-surface-container';
12: 
```

### components/ErrorBoundary.tsx
<a id="componentsErrorBoundarytsx"></a>

**Path:** `frontend/src/components/ErrorBoundary.tsx`

**Description:** Component in components module.

#### Class: `ErrorBoundary`
- **Purpose:** Defines the `ErrorBoundary` class.
- **Snippet:**
```typescript
13: export class ErrorBoundary extends Component<Props, State> {
14:   public state: State = {
15:     hasError: false,
16:     error: null
17:   };
```

### components/Footer.tsx
<a id="componentsFootertsx"></a>

**Path:** `frontend/src/components/Footer.tsx`

**Description:** Component in components module.

#### Arrow Function: `Footer`
- **Purpose:** Exported or module-level variable `Footer`.
- **Snippet:**
```typescript
3: export const Footer: React.FC = () => {
4:   return (
5:     <footer className="bg-surface-container-lowest text-on-surface font-label-mono text-label-mono-sm w-full py-6 flex justify-center items-center relative z-10">
6:       <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-[1400px] justify-between px-margin-desktop">
```

### components/GoalCard.tsx
<a id="componentsGoalCardtsx"></a>

**Path:** `frontend/src/components/GoalCard.tsx`

**Description:** Component in components module.

#### Arrow Function: `GoalCard`
- **Purpose:** Exported or module-level variable `GoalCard`.
- **Snippet:**
```typescript
12: export const GoalCard: React.FC<GoalCardProps> = ({ goal, onComplete, onMomentumBoost }) => {
13:   const [loading, setLoading] = useState(false);
14:   
15:   const isCompleted = goal.status === 'completed';
```

### components/HabitItem.tsx
<a id="componentsHabitItemtsx"></a>

**Path:** `frontend/src/components/HabitItem.tsx`

**Description:** Component in components module.

#### Arrow Function: `HabitItem`
- **Purpose:** Exported or module-level variable `HabitItem`.
- **Snippet:**
```typescript
12: export const HabitItem: React.FC<HabitItemProps> = ({ habit, onComplete, onMomentumBoost }) => {
13:   const [loading, setLoading] = useState(false);
14:   
15:   const completedToday = habit.lastCompletedDate ? isToday(parseISO(habit.lastCompletedDate)) : false;
```

### components/Marquee.tsx
<a id="componentsMarqueetsx"></a>

**Path:** `frontend/src/components/Marquee.tsx`

**Description:** Component in components module.

#### Arrow Function: `Marquee`
- **Purpose:** Exported or module-level variable `Marquee`.
- **Snippet:**
```typescript
8: export const Marquee: React.FC<MarqueeProps> = ({ 
9:   text = "✦ COMPONENT LIBRARY v1.0 ✦ DESIGN SYSTEM DOCUMENTATION ✦ EDITORIAL NEO-BRUTALIST ",
10:   className = "border-b-border-width-heavy bg-secondary-container"
11: }) => {
```

### components/Navbar.tsx
<a id="componentsNavbartsx"></a>

**Path:** `frontend/src/components/Navbar.tsx`

**Description:** Component in components module.

#### Arrow Function: `Navbar`
- **Purpose:** Exported or module-level variable `Navbar`.
- **Snippet:**
```typescript
4: export const Navbar: React.FC = () => {
5:   const navigate = useNavigate();
6: 
7:   return (
```

### components/Particles.tsx
<a id="componentsParticlestsx"></a>

**Path:** `frontend/src/components/Particles.tsx`

**Description:** Component in components module.

#### Arrow Function: `Particles`
- **Purpose:** Exported or module-level variable `Particles`.
- **Snippet:**
```typescript
3: export const Particles: React.FC = () => {
4:   const containerRef = useRef<HTMLDivElement>(null);
5: 
6:   useEffect(() => {
```

### components/ProtectedRoute.tsx
<a id="componentsProtectedRoutetsx"></a>

**Path:** `frontend/src/components/ProtectedRoute.tsx`

**Description:** Component in components module.

#### Arrow Function: `ProtectedRoute`
- **Purpose:** Exported or module-level variable `ProtectedRoute`.
- **Snippet:**
```typescript
9: export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
10:   const { user, loading } = useAuth();
11:   const location = useLocation();
12: 
```

### components/RecommendationCard.tsx
<a id="componentsRecommendationCardtsx"></a>

**Path:** `frontend/src/components/RecommendationCard.tsx`

**Description:** Component in components module.

#### Arrow Function: `RecommendationCard`
- **Purpose:** Exported or module-level variable `RecommendationCard`.
- **Snippet:**
```typescript
9: export const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec }) => {
10:   const navigate = useNavigate();
11:   
12:   const priorityColors = {
```

### components/RiskBadge.tsx
<a id="componentsRiskBadgetsx"></a>

**Path:** `frontend/src/components/RiskBadge.tsx`

**Description:** Component in components module.

#### Arrow Function: `RiskBadge`
- **Purpose:** Exported or module-level variable `RiskBadge`.
- **Snippet:**
```typescript
8: export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, description }) => {
9:   return (
10:     <div className="bg-surface-container-lowest border-border-width border-on-background p-6 flex flex-col justify-center items-center gap-4 relative overflow-hidden group">
11:       <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
```

### components/SideNav.tsx
<a id="componentsSideNavtsx"></a>

**Path:** `frontend/src/components/SideNav.tsx`

**Description:** Component in components module.

#### Arrow Function: `SideNav`
- **Purpose:** Exported or module-level variable `SideNav`.
- **Snippet:**
```typescript
4: export const SideNav: React.FC = () => {
5:   const location = useLocation();
6:   const path = location.pathname;
7: 
```

### components/SourceBadge.tsx
<a id="componentsSourceBadgetsx"></a>

**Path:** `frontend/src/components/SourceBadge.tsx`

**Description:** Component in components module.

#### Arrow Function: `SourceBadge`
- **Purpose:** Exported or module-level variable `SourceBadge`.
- **Snippet:**
```typescript
7: export const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
8:   return (
9:     <span className="bg-surface-container-highest text-on-background font-label-mono-sm text-label-mono-sm px-2 py-1 border-border-width border-on-background uppercase font-bold">
10:       [{source}]
```

### components/Toggle.tsx
<a id="componentsToggletsx"></a>

**Path:** `frontend/src/components/Toggle.tsx`

**Description:** Component in components module.

#### Arrow Function: `Toggle`
- **Purpose:** Exported or module-level variable `Toggle`.
- **Snippet:**
```typescript
9: export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
10:   return (
11:     <label className="relative inline-flex items-center cursor-pointer">
12:       <input 
```

## context

### context/AuthContext.tsx
<a id="contextAuthContexttsx"></a>

**Path:** `frontend/src/context/AuthContext.tsx`

**Description:** Component in context module.

#### Constant: `AuthContext`
- **Purpose:** Exported or module-level variable `AuthContext`.
- **Snippet:**
```typescript
18: const AuthContext = createContext<AuthContextType | undefined>(undefined);
19: 
20: export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
21:   const [user, setUser] = useState<User | null>(null);
```

#### Arrow Function: `AuthProvider`
- **Purpose:** Exported or module-level variable `AuthProvider`.
- **Snippet:**
```typescript
20: export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
21:   const [user, setUser] = useState<User | null>(null);
22:   const [loading, setLoading] = useState(true);
23: 
```

#### Constant: `useAuth`
- **Purpose:** Exported or module-level variable `useAuth`.
- **Snippet:**
```typescript
48: export const useAuth = () => {
49:   const context = useContext(AuthContext);
50:   if (context === undefined) {
51:     throw new Error('useAuth must be used within an AuthProvider');
```

## hooks

### hooks/useDashboardData.ts
<a id="hooksuseDashboardDatats"></a>

**Path:** `frontend/src/hooks/useDashboardData.ts`

**Description:** Component in hooks module.

#### Constant: `useDashboardData`
- **Purpose:** Exported or module-level variable `useDashboardData`.
- **Snippet:**
```typescript
51: export const useDashboardData = () => {
52:   const { user } = useAuth();
53:   const [userData, setUserData] = useState<UserData | null>(null);
54:   const [tasks, setTasks] = useState<TaskData[]>([]);
```

### hooks/useGoalsAndHabits.ts
<a id="hooksuseGoalsAndHabitsts"></a>

**Path:** `frontend/src/hooks/useGoalsAndHabits.ts`

**Description:** Component in hooks module.

#### Function: `useGoalsAndHabits()`
- **Purpose:** Handles logic for `useGoalsAndHabits`.
- **Snippet:**
```typescript
6: export function useGoalsAndHabits() {
7:   const { user } = useAuth();
8:   const [goals, setGoals] = useState<Goal[]>([]);
9:   const [habits, setHabits] = useState<Habit[]>([]);
10:   const [loading, setLoading] = useState(true);
```

### hooks/useRecommendations.ts
<a id="hooksuseRecommendationsts"></a>

**Path:** `frontend/src/hooks/useRecommendations.ts`

**Description:** Component in hooks module.

#### Constant: `useRecommendations`
- **Purpose:** Exported or module-level variable `useRecommendations`.
- **Snippet:**
```typescript
5: export const useRecommendations = () => {
6:   const { user } = useAuth();
7:   const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
8:   const [memoryPatterns, setMemoryPatterns] = useState<MemoryPattern[]>([]);
```

### hooks/useUserSettings.ts
<a id="hooksuseUserSettingsts"></a>

**Path:** `frontend/src/hooks/useUserSettings.ts`

**Description:** Component in hooks module.

#### Constant: `useUserSettings`
- **Purpose:** Exported or module-level variable `useUserSettings`.
- **Snippet:**
```typescript
27: export const useUserSettings = () => {
28:   const { user } = useAuth();
29:   const [settings, setSettings] = useState<UserSettings | null>(null);
30:   const [loading, setLoading] = useState(true);
```

## lib

### lib/apiClient.ts
<a id="libapiClientts"></a>

**Path:** `frontend/src/lib/apiClient.ts`

**Description:** Component in lib module.

#### Function: `getAuthHeaders()`
- **Purpose:** Handles logic for `getAuthHeaders`.
- **Snippet:**
```typescript
14: async function getAuthHeaders(): Promise<HeadersInit> {
15:   const user = auth.currentUser;
16:   if (!user) {
17:     throw new Error('User is not authenticated');
18:   }
```

#### Constant: `API_BASE_URL`
- **Purpose:** Exported or module-level variable `API_BASE_URL`.
- **Snippet:**
```typescript
3: const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
4: 
5: class ApiError extends Error {
6:   status: number;
```

#### Constant: `api`
- **Purpose:** Exported or module-level variable `api`.
- **Snippet:**
```typescript
229: export const api = new ApiClient();
230: 
```

#### Class: `ApiError`
- **Purpose:** Defines the `ApiError` class.
- **Snippet:**
```typescript
5: class ApiError extends Error {
6:   status: number;
7:   constructor(status: number, message: string) {
8:     super(message);
9:     this.status = status;
```

#### Class: `ApiClient`
- **Purpose:** Defines the `ApiClient` class.
- **Snippet:**
```typescript
109: class ApiClient {
110:   private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
111:     return fetchApi<T>(`/api/v1${endpoint}`, options);
112:   }
113: 
```

### lib/firebase.ts
<a id="libfirebasets"></a>

**Path:** `frontend/src/lib/firebase.ts`

**Description:** Component in lib module.

#### Constant: `requiredEnvVars`
- **Purpose:** Exported or module-level variable `requiredEnvVars`.
- **Snippet:**
```typescript
5: const requiredEnvVars = [
6:   'VITE_FIREBASE_API_KEY',
7:   'VITE_FIREBASE_AUTH_DOMAIN',
8:   'VITE_FIREBASE_PROJECT_ID',
```

#### Constant: `firebaseConfig`
- **Purpose:** Exported or module-level variable `firebaseConfig`.
- **Snippet:**
```typescript
20: const firebaseConfig = {
21:   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
22:   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
23:   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
```

#### Constant: `app`
- **Purpose:** Exported or module-level variable `app`.
- **Snippet:**
```typescript
29: export const app = initializeApp(firebaseConfig);
30: export const auth = getAuth(app);
31: export const db = getFirestore(app);
32: 
```

#### Constant: `auth`
- **Purpose:** Exported or module-level variable `auth`.
- **Snippet:**
```typescript
30: export const auth = getAuth(app);
31: export const db = getFirestore(app);
32: 
```

#### Constant: `db`
- **Purpose:** Exported or module-level variable `db`.
- **Snippet:**
```typescript
31: export const db = getFirestore(app);
32: 
```

## pages

### pages/Assistant.tsx
<a id="pagesAssistanttsx"></a>

**Path:** `frontend/src/pages/Assistant.tsx`

**Description:** Component in pages module.

#### Arrow Function: `Assistant`
- **Purpose:** Exported or module-level variable `Assistant`.
- **Snippet:**
```typescript
13: export const Assistant: React.FC = () => {
14:   const { user } = useAuth();
15:   const [messages, setMessages] = useState<Message[]>([
16:     {
```

### pages/Auth.tsx
<a id="pagesAuthtsx"></a>

**Path:** `frontend/src/pages/Auth.tsx`

**Description:** Component in pages module.

#### Arrow Function: `Auth`
- **Purpose:** Exported or module-level variable `Auth`.
- **Snippet:**
```typescript
5: export const Auth: React.FC = () => {
6:   const { user, signInWithGoogle, loading } = useAuth();
7:   const navigate = useNavigate();
8: 
```

### pages/Calendar.tsx
<a id="pagesCalendartsx"></a>

**Path:** `frontend/src/pages/Calendar.tsx`

**Description:** Component in pages module.

#### Arrow Function: `Calendar`
- **Purpose:** Exported or module-level variable `Calendar`.
- **Snippet:**
```typescript
11: export const Calendar: React.FC = () => {
12:   const { tasks, loading } = useDashboardData();
13:   const [currentDate, setCurrentDate] = useState(new Date());
14:   const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
```

### pages/Dashboard.tsx
<a id="pagesDashboardtsx"></a>

**Path:** `frontend/src/pages/Dashboard.tsx`

**Description:** Component in pages module.

#### Arrow Function: `Dashboard`
- **Purpose:** Exported or module-level variable `Dashboard`.
- **Snippet:**
```typescript
14: export const Dashboard: React.FC = () => {
15:   const navigate = useNavigate();
16:   const { user } = useAuth();
17:   const { userData, tasks, activities, approvals, loading } = useDashboardData();
```

### pages/Focus.tsx
<a id="pagesFocustsx"></a>

**Path:** `frontend/src/pages/Focus.tsx`

**Description:** Component in pages module.

#### Arrow Function: `Focus`
- **Purpose:** Exported or module-level variable `Focus`.
- **Snippet:**
```typescript
6: export const Focus: React.FC = () => {
7:   const { tasks, loading: tasksLoading } = useDashboardData();
8:   const { settings, loading: settingsLoading } = useUserSettings();
9:   
```

### pages/Landing.tsx
<a id="pagesLandingtsx"></a>

**Path:** `frontend/src/pages/Landing.tsx`

**Description:** Component in pages module.

#### Arrow Function: `Landing`
- **Purpose:** Exported or module-level variable `Landing`.
- **Snippet:**
```typescript
9: export const Landing: React.FC = () => {
10:   const navigate = useNavigate();
11: 
12:   useEffect(() => {
```

### pages/Settings.tsx
<a id="pagesSettingstsx"></a>

**Path:** `frontend/src/pages/Settings.tsx`

**Description:** Component in pages module.

#### Arrow Function: `Settings`
- **Purpose:** Exported or module-level variable `Settings`.
- **Snippet:**
```typescript
10: export const Settings: React.FC = () => {
11:   const { user, logout } = useAuth();
12:   const { settings, loading, toggleChannel } = useUserSettings();
13:   const navigate = useNavigate();
```

### pages/Tasks.tsx
<a id="pagesTaskstsx"></a>

**Path:** `frontend/src/pages/Tasks.tsx`

**Description:** Component in pages module.

#### Arrow Function: `Tasks`
- **Purpose:** Exported or module-level variable `Tasks`.
- **Snippet:**
```typescript
11: export const Tasks: React.FC = () => {
12:   const { tasks, loading } = useDashboardData();
13:   const [viewMode, setViewMode] = useState<ViewMode>('list');
14:   const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
```

## Root

### App.tsx
<a id="Apptsx"></a>

**Path:** `frontend/src/App.tsx`

**Description:** Component in Root module.

#### Function: `App()`
- **Purpose:** Handles logic for `App`.
- **Snippet:**
```typescript
14: function App() {
15:   return (
16:     <AuthProvider>
17:       <BrowserRouter>
18:         <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden">
```

### index.css
<a id="indexcss"></a>

**Path:** `frontend/src/index.css`

**Description:** Configuration / Style file.

```css
1: @import "tailwindcss";
2: @config "../tailwind.config.js";
3: 
4:   .btn-stamped {
5:     box-shadow: 4px 4px 0px var(--color-on-surface, #1c1b1b);
6:     transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
7:     transform: translate(0, 0);
8:   }
9:   .btn-stamped:hover {
10:     box-shadow: 8px 8px 0px var(--color-on-surface, #1c1b1b);
11:     transform: translate(-4px, -4px);
12:   }
13:   .btn-stamped:active {
14:     box-shadow: 0px 0px 0px var(--color-on-surface, #1c1b1b);
15:     transform: translate(2px, 2px);
... (truncated)
```

### main.tsx
<a id="maintsx"></a>

**Path:** `frontend/src/main.tsx`

**Description:** Component in Root module.

*No major exported functions/classes detected via simple parsing.*

