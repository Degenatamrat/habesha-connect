# Habesha Dating App - Product Requirements Document

A modern dating platform connecting Ethiopians and Eritreans living in Arab countries, fostering meaningful connections within the diaspora community.

**Experience Qualities**:
1. **Warm & Welcoming**: Creates a sense of home and community for diaspora users far from their homeland
2. **Culturally Authentic**: Respects and celebrates Ethiopian/Eritrean heritage through thoughtful design and features  
3. **Trustworthy & Safe**: Prioritizes user safety with robust moderation, verification, and privacy controls

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Requires sophisticated matching algorithms, real-time messaging, content moderation, and multi-role user management with admin capabilities

## Essential Features

**User Authentication & Profiles**
- Functionality: Secure account creation with comprehensive cultural profile building
- Purpose: Establishes trust and enables culturally-aware matching
- Trigger: App launch or registration flow
- Progression: Welcome → Sign up → Profile creation → Photo upload → Interests/preferences → Verification → Discovery
- Success criteria: Users can create rich profiles highlighting cultural background and preferences

**Smart Discovery & Matching**  
- Functionality: Swipe-based discovery with cultural filters and intelligent recommendations
- Purpose: Connect compatible users based on location, culture, and shared values
- Trigger: Completing profile setup or opening discovery tab
- Progression: Profile cards → Swipe left/right → Mutual match notification → Chat unlock
- Success criteria: Users find relevant matches and engage in meaningful conversations

**Real-time Messaging**
- Functionality: Rich chat with text, images, voice messages, and cultural expressions
- Purpose: Enable deep connection building between matched users
- Trigger: Successful mutual match
- Progression: Match notification → Chat opens → Message exchange → Relationship building
- Success criteria: Users engage in ongoing conversations leading to offline meetings

**Cultural Localization**
- Functionality: Full app experience in Amharic and English with cultural context
- Purpose: Make app accessible and relevant for all diaspora community members
- Trigger: App launch or language settings
- Progression: Language selection → Localized interface → Cultural content → Enhanced engagement
- Success criteria: Users comfortably navigate in their preferred language

**Admin Dashboard System**
- Functionality: Comprehensive admin dashboard for complete platform management including user management, content moderation, analytics, profile approvals, system settings, and activity logging
- Purpose: Maintain safe, authentic community environment with full administrative control
- Trigger: Admin login at /admin endpoint with role-based authentication
- Progression: Admin auth → Overview dashboard → User management → Content moderation → Analytics → Settings → Audit logs
- Success criteria: Complete admin control over platform with secure access, comprehensive monitoring, and effective community management

## Edge Case Handling

**Network Connectivity**: Offline message queuing with sync when reconnected
**Photo Verification**: AI-powered photo validation to prevent fake profiles  
**Cultural Sensitivity**: Content filters for inappropriate cultural references
**Geographic Accuracy**: Location verification to ensure authentic diaspora connections
**Language Mixing**: Support for users who mix Amharic/Arabic/English in conversations
**Family Privacy**: Options to hide profile from family members in same location

## Design Direction

The design should evoke warmth, cultural pride, and trustworthiness - feeling like a welcoming community center that bridges Ethiopian/Eritrean heritage with modern diaspora life. Rich interface with cultural elements that celebrate identity while maintaining contemporary usability.

## Color Selection

Custom palette inspired by Ethiopian cultural colors and warm diaspora community feelings.

- **Primary Color**: Deep Ethiopian Green (oklch(0.45 0.15 140)) - represents heritage and growth, used for main actions and cultural pride
- **Secondary Colors**: 
  - Warm Sand (oklch(0.85 0.08 75)) - represents the warmth of Arab countries and hospitality
  - Rich Red (oklch(0.55 0.20 25)) - Ethiopian flag heritage, used for important highlights
- **Accent Color**: Golden Amber (oklch(0.75 0.12 65)) - warmth and connection, for CTAs and active states  
- **Foreground/Background Pairings**:
  - Background (Cream White oklch(0.98 0.02 75)): Dark Charcoal text (oklch(0.2 0.05 140)) - Ratio 8.2:1 ✓
  - Card (Pure White oklch(1 0 0)): Dark Charcoal text (oklch(0.2 0.05 140)) - Ratio 9.1:1 ✓
  - Primary (Deep Green oklch(0.45 0.15 140)): White text (oklch(1 0 0)) - Ratio 6.8:1 ✓
  - Secondary (Warm Sand oklch(0.85 0.08 75)): Dark Charcoal text (oklch(0.2 0.05 140)) - Ratio 7.2:1 ✓
  - Accent (Golden Amber oklch(0.75 0.12 65)): Dark Charcoal text (oklch(0.2 0.05 140)) - Ratio 4.9:1 ✓

## Font Selection

Typography should convey cultural warmth while maintaining modern readability, using fonts that work well with both Latin and Amharic scripts when needed.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/32px/tight letter spacing - for main branding
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing - for major sections  
  - H3 (Card Titles): Inter Medium/18px/normal spacing - for user names and key info
  - Body Text: Inter Regular/16px/relaxed line height - for bios and messages
  - Small Text: Inter Regular/14px/normal spacing - for metadata and labels

## Animations

Animations should feel warm and inviting like traditional Ethiopian hospitality, with subtle movements that guide users naturally through cultural connection experiences.

- **Purposeful Meaning**: Smooth card transitions evoke the careful consideration of traditional matchmaking, while gentle micro-interactions create feelings of warmth and community
- **Hierarchy of Movement**: Swipe animations are the primary focus, followed by match celebrations, then subtle hover states that don't distract from human connections

## Component Selection

- **Components**: Card-based profile displays, Dialog for matches, Form components for detailed cultural preferences, Tabs for navigation between discovery/matches/messages, Avatar with verification badges, Button variants for different action types
- **Customizations**: Cultural interest tags, location-specific filters, Amharic text input support, photo verification indicators, match celebration animations
- **States**: Cards show hover/swipe states, buttons indicate loading during matches, inputs validate cultural data formats, verified profiles have distinct styling  
- **Icon Selection**: Heart for likes, X for pass, Chat bubbles for messages, Location pin for diaspora communities, Star for super likes, Shield for verification
- **Spacing**: Generous 24px card spacing, 16px internal padding, 8px for small elements, maintaining breathing room for thoughtful decision making
- **Mobile**: Bottom tab navigation with large touch targets, swipeable card stack optimized for thumb navigation, collapsible chat interface, responsive grid layouts that work across Arabic RTL and Ethiopian LTR text flows