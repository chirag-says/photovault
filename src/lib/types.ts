/**
 * ===========================================
 * PHOTOVAULT - TypeScript Type Definitions
 * ===========================================
 * Central type definitions for the entire application
 */

// ===========================================
// USER TYPES
// ===========================================

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role?: UserRole;
}

// ===========================================
// INVITE CODE TYPES
// ===========================================

export interface InviteCode {
  id: string;
  code: string;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInviteCodeInput {
  max_uses?: number;
  expires_at?: string;
}

export interface InviteCodeWithCreator extends InviteCode {
  creator?: {
    email: string;
  };
}

// ===========================================
// IMAGE TYPES
// ===========================================

export interface Image {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string | null;
  preview_path: string;
  full_path: string;
  file_size_preview: number | null;
  file_size_full: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
}

export interface ImageWithUrls extends Image {
  preview_url: string;
  full_url: string;
}

export interface UploadImageInput {
  file: File;
  user_id: string;
}

// ===========================================
// SESSION TYPES
// ===========================================

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ===========================================
// AUTH TYPES
// ===========================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  inviteCode: string;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  token?: string;
}

// ===========================================
// ADMIN TYPES
// ===========================================

export interface AdminStats {
  totalUsers: number;
  totalImages: number;
  totalInviteCodes: number;
  activeInviteCodes: number;
}

// ===========================================
// FORM VALIDATION TYPES
// ===========================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: ValidationError[];
  success: boolean;
}

// ===========================================
// ALBUM TYPES
// ===========================================

export type AlbumVisibility = 'public' | 'private';

export interface Album {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_image_id: string | null;
  visibility: AlbumVisibility;
  access_code: string | null;
  image_count: number;
  created_at: string;
  updated_at: string;
}

export interface AlbumWithCover extends Album {
  cover_url: string | null;
}

export interface AlbumWithImages extends Album {
  images: ImageWithUrls[];
  cover_url?: string | null;
  isOwner?: boolean;
  created_by?: string;
}

// Album type for public browsing (includes visibility and creator name)
export interface BrowseAlbum {
  id: string;
  name: string;
  description: string | null;
  visibility: AlbumVisibility;
  image_count: number;
  cover_url: string | null;
  created_by: string;
  created_at: string;
}

export interface CreateAlbumInput {
  name: string;
  description?: string;
  visibility: AlbumVisibility;
}

export interface AlbumImage {
  id: string;
  album_id: string;
  image_id: string;
  display_order: number;
  added_at: string;
}

// ===========================================
// COMPONENT PROP TYPES
// ===========================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export interface ImageCardProps {
  image: ImageWithUrls;
  onClick: (image: ImageWithUrls) => void;
}

export interface ImageGridProps {
  images: ImageWithUrls[];
  isLoading?: boolean;
  onImageClick: (image: ImageWithUrls) => void;
}

