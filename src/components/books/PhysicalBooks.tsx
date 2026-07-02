import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, BookOpen, MapPin, Calendar, CheckCircle } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type PhysicalBook = Database['public']['Tables']['physical_books']['Row'];
type BookLoan = Database['public']['Tables']['book_loans']['Row'];

export function PhysicalBooks() {
  const { profile } = useAuth();
  const [books, setBooks] = useState<PhysicalBook[]>([]);
  const [myLoans, setMyLoans] = useState<BookLoan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'myloans'>('browse');

  useEffect(() => {
    loadBooks();
    loadMyLoans();
  }, []);

  const loadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('physical_books')
        .select('*')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyLoans = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('book_loans')
        .select('*, physical_books(*)')
        .eq('user_id', profile.id)
        .order('borrowed_at', { ascending: false });

      if (error) throw error;
      setMyLoans(data || []);
    } catch (error) {
      console.error('Error loading loans:', error);
    }
  };

  const categories = ['all', ...new Set(books.map(book => book.category))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Physical Books</h2>
          <p className="text-gray-600">Browse and borrow physical books from the library</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'browse'
                  ? 'border-b-2 border-[#002F6C] text-[#002F6C]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Books
            </button>
            <button
              onClick={() => setActiveTab('myloans')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'myloans'
                  ? 'border-b-2 border-[#002F6C] text-[#002F6C]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Loans ({myLoans.filter(l => l.status === 'borrowed').length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'browse' ? (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002F6C] focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002F6C] focus:border-transparent outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002F6C]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks.map(book => (
                    <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                      <div className="flex gap-4">
                        <div className="w-20 h-28 bg-gradient-to-br from-[#002F6C] to-[#004a9c] rounded flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">{book.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {book.category}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        {book.shelf_location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{book.shelf_location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{book.available_copies} of {book.total_copies} available</span>
                        </div>
                      </div>

                      <button
                        disabled={book.available_copies === 0}
                        className={`mt-4 w-full py-2 rounded-lg font-medium transition ${
                          book.available_copies > 0
                            ? 'bg-[#002F6C] text-white hover:bg-[#001f4d]'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {book.available_copies > 0 ? 'Request to Borrow' : 'Not Available'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {myLoans.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">You don't have any book loans yet</p>
                </div>
              ) : (
                myLoans.map(loan => {
                  const book = loan.physical_books as unknown as PhysicalBook;
                  const daysUntilDue = getDaysUntilDue(loan.due_date);
                  const isOverdue = daysUntilDue < 0;

                  return (
                    <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="w-16 h-24 bg-gradient-to-br from-[#002F6C] to-[#004a9c] rounded flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{book?.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{book?.author}</p>

                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Borrowed: {new Date(loan.borrowed_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                  Due: {new Date(loan.due_date).toLocaleDateString()}
                                  {loan.status === 'borrowed' && (
                                    <span className="ml-2">
                                      ({isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`})
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            loan.status === 'returned'
                              ? 'bg-green-100 text-green-800'
                              : isOverdue
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {loan.status === 'returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
                          </span>
                          {loan.status === 'borrowed' && (
                            <button className="px-4 py-2 bg-[#002F6C] text-white rounded-lg hover:bg-[#001f4d] transition text-sm flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Return Book
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
