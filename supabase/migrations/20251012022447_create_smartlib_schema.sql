/*
  # SmartLib UEW Database Schema

  ## Overview
  Complete database schema for SmartLib UEW digital library management system.
  Supports both physical library attendance tracking and digital e-library resources.

  ## New Tables

  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique, not null)
  - `full_name` (text, not null)
  - `student_id` (text, unique, nullable) - For students
  - `staff_id` (text, unique, nullable) - For staff
  - `role` (text, not null) - 'student', 'staff', or 'admin'
  - `department` (text, nullable)
  - `phone` (text, nullable)
  - `avatar_url` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `attendance_logs`
  Tracks library check-ins and check-outs
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `check_in_time` (timestamptz, not null)
  - `check_out_time` (timestamptz, nullable)
  - `purpose` (text) - Study, research, borrow, etc.
  - `created_at` (timestamptz)

  ### 3. `physical_books`
  Physical book inventory
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `author` (text, not null)
  - `isbn` (text, unique, nullable)
  - `publisher` (text, nullable)
  - `publication_year` (integer, nullable)
  - `category` (text, not null)
  - `total_copies` (integer, not null, default 1)
  - `available_copies` (integer, not null, default 1)
  - `shelf_location` (text, nullable)
  - `description` (text, nullable)
  - `cover_image_url` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `book_loans`
  Physical book borrowing records
  - `id` (uuid, primary key)
  - `book_id` (uuid, references physical_books)
  - `user_id` (uuid, references profiles)
  - `borrowed_at` (timestamptz, not null)
  - `due_date` (timestamptz, not null)
  - `returned_at` (timestamptz, nullable)
  - `status` (text, not null) - 'borrowed', 'returned', 'overdue'
  - `notes` (text, nullable)
  - `created_at` (timestamptz)

  ### 5. `digital_resources`
  E-library digital content
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `author` (text, not null)
  - `resource_type` (text, not null) - 'ebook', 'journal', 'past_question', 'lecture_note'
  - `category` (text, not null)
  - `department` (text, nullable)
  - `course_code` (text, nullable)
  - `file_url` (text, not null)
  - `file_size` (bigint, nullable)
  - `file_type` (text, nullable) - pdf, doc, etc.
  - `description` (text, nullable)
  - `cover_image_url` (text, nullable)
  - `published_year` (integer, nullable)
  - `uploaded_by` (uuid, references profiles)
  - `download_count` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `resource_access_logs`
  Tracks digital resource downloads/views
  - `id` (uuid, primary key)
  - `resource_id` (uuid, references digital_resources)
  - `user_id` (uuid, references profiles)
  - `access_type` (text, not null) - 'view', 'download'
  - `accessed_at` (timestamptz, not null)

  ### 7. `notifications`
  System notifications for users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text, not null)
  - `message` (text, not null)
  - `type` (text, not null) - 'due_date', 'overdue', 'system'
  - `read` (boolean, default false)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to access their own data
  - Admin-only policies for management operations
  - Public read access for digital resources (authenticated users)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  student_id text UNIQUE,
  staff_id text UNIQUE,
  role text NOT NULL CHECK (role IN ('student', 'staff', 'admin')),
  department text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_logs table
CREATE TABLE IF NOT EXISTS attendance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  purpose text,
  created_at timestamptz DEFAULT now()
);

-- Create physical_books table
CREATE TABLE IF NOT EXISTS physical_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE,
  publisher text,
  publication_year integer,
  category text NOT NULL,
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  shelf_location text,
  description text,
  cover_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create book_loans table
CREATE TABLE IF NOT EXISTS book_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES physical_books(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  borrowed_at timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz NOT NULL,
  returned_at timestamptz,
  status text NOT NULL CHECK (status IN ('borrowed', 'returned', 'overdue')) DEFAULT 'borrowed',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create digital_resources table
CREATE TABLE IF NOT EXISTS digital_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('ebook', 'journal', 'past_question', 'lecture_note')),
  category text NOT NULL,
  department text,
  course_code text,
  file_url text NOT NULL,
  file_size bigint,
  file_type text,
  description text,
  cover_image_url text,
  published_year integer,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resource_access_logs table
CREATE TABLE IF NOT EXISTS resource_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES digital_resources(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  access_type text NOT NULL CHECK (access_type IN ('view', 'download')),
  accessed_at timestamptz NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('due_date', 'overdue', 'system')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_id ON attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_check_in ON attendance_logs(check_in_time);
CREATE INDEX IF NOT EXISTS idx_book_loans_user_id ON book_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_book_loans_book_id ON book_loans(book_id);
CREATE INDEX IF NOT EXISTS idx_book_loans_status ON book_loans(status);
CREATE INDEX IF NOT EXISTS idx_digital_resources_type ON digital_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_digital_resources_category ON digital_resources(category);
CREATE INDEX IF NOT EXISTS idx_resource_access_logs_resource_id ON resource_access_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_access_logs_user_id ON resource_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for attendance_logs
CREATE POLICY "Users can view own attendance"
  ON attendance_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own attendance"
  ON attendance_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attendance"
  ON attendance_logs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all attendance"
  ON attendance_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for physical_books
CREATE POLICY "Everyone can view books"
  ON physical_books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage books"
  ON physical_books FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for book_loans
CREATE POLICY "Users can view own loans"
  ON book_loans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all loans"
  ON book_loans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage loans"
  ON book_loans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for digital_resources
CREATE POLICY "Authenticated users can view resources"
  ON digital_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage resources"
  ON digital_resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for resource_access_logs
CREATE POLICY "Users can view own access logs"
  ON resource_access_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own access logs"
  ON resource_access_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all access logs"
  ON resource_access_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_physical_books_updated_at
  BEFORE UPDATE ON physical_books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_resources_updated_at
  BEFORE UPDATE ON digital_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();