export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          student_id: string | null
          staff_id: string | null
          role: 'student' | 'staff' | 'admin'
          department: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          student_id?: string | null
          staff_id?: string | null
          role: 'student' | 'staff' | 'admin'
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          student_id?: string | null
          staff_id?: string | null
          role?: 'student' | 'staff' | 'admin'
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance_logs: {
        Row: {
          id: string
          user_id: string
          check_in_time: string
          check_out_time: string | null
          purpose: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          check_in_time?: string
          check_out_time?: string | null
          purpose?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          check_in_time?: string
          check_out_time?: string | null
          purpose?: string | null
          created_at?: string
        }
      }
      physical_books: {
        Row: {
          id: string
          title: string
          author: string
          isbn: string | null
          publisher: string | null
          publication_year: number | null
          category: string
          total_copies: number
          available_copies: number
          shelf_location: string | null
          description: string | null
          cover_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          isbn?: string | null
          publisher?: string | null
          publication_year?: number | null
          category: string
          total_copies?: number
          available_copies?: number
          shelf_location?: string | null
          description?: string | null
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          isbn?: string | null
          publisher?: string | null
          publication_year?: number | null
          category?: string
          total_copies?: number
          available_copies?: number
          shelf_location?: string | null
          description?: string | null
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      book_loans: {
        Row: {
          id: string
          book_id: string
          user_id: string
          borrowed_at: string
          due_date: string
          returned_at: string | null
          status: 'borrowed' | 'returned' | 'overdue'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          user_id: string
          borrowed_at?: string
          due_date: string
          returned_at?: string | null
          status?: 'borrowed' | 'returned' | 'overdue'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          user_id?: string
          borrowed_at?: string
          due_date?: string
          returned_at?: string | null
          status?: 'borrowed' | 'returned' | 'overdue'
          notes?: string | null
          created_at?: string
        }
      }
      digital_resources: {
        Row: {
          id: string
          title: string
          author: string
          resource_type: 'ebook' | 'journal' | 'past_question' | 'lecture_note'
          category: string
          department: string | null
          course_code: string | null
          file_url: string
          file_size: number | null
          file_type: string | null
          description: string | null
          cover_image_url: string | null
          published_year: number | null
          uploaded_by: string | null
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          resource_type: 'ebook' | 'journal' | 'past_question' | 'lecture_note'
          category: string
          department?: string | null
          course_code?: string | null
          file_url: string
          file_size?: number | null
          file_type?: string | null
          description?: string | null
          cover_image_url?: string | null
          published_year?: number | null
          uploaded_by?: string | null
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          resource_type?: 'ebook' | 'journal' | 'past_question' | 'lecture_note'
          category?: string
          department?: string | null
          course_code?: string | null
          file_url?: string
          file_size?: number | null
          file_type?: string | null
          description?: string | null
          cover_image_url?: string | null
          published_year?: number | null
          uploaded_by?: string | null
          download_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      resource_access_logs: {
        Row: {
          id: string
          resource_id: string
          user_id: string
          access_type: 'view' | 'download'
          accessed_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          user_id: string
          access_type: 'view' | 'download'
          accessed_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          user_id?: string
          access_type?: 'view' | 'download'
          accessed_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'due_date' | 'overdue' | 'system'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'due_date' | 'overdue' | 'system'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'due_date' | 'overdue' | 'system'
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}
