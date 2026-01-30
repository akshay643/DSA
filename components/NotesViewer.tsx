'use client';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ArrowLeft, Trash2, Plus, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Question } from '@/types';

interface NotesViewerProps {
  onBack: () => void;
  completedQuestions?: Array<{ question: Question; progress: any }>;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  linkedQuestionId?: string;
}

export default function NotesViewer({ onBack, completedQuestions = [] }: NotesViewerProps) {
  const [notes, setNotes] = useLocalStorage<Note[]>('dsa-notes', []);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSyncNotification, setShowSyncNotification] = useState(false);

  const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null;
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const syncCompletedQuestions = () => {
    if (completedQuestions.length === 0) {
      alert('No completed questions to sync');
      return;
    }

    // Check if completed questions note already exists
    const existingNote = notes.find(n => n.linkedQuestionId === 'completed-questions');
    
    const titles = completedQuestions.map(({ question }) => `• ${question.title}`).join('\n');
    const content = `Completed Questions:\n\n${titles}`;

    if (existingNote) {
      // Update existing note
      updateNote({
        ...existingNote,
        content: content,
        updatedAt: new Date().toISOString(),
      });
      setSelectedNoteId(existingNote.id);
    } else {
      // Create new note
      const newNote: Note = {
        id: `note-completed-questions`,
        title: 'Completed Questions',
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        linkedQuestionId: 'completed-questions',
      };
      setNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
    }

    setShowSyncNotification(true);
    setTimeout(() => setShowSyncNotification(false), 3000);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const deleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(n => n.id !== noteId));
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (selectedNote) {
      updateNote({
        ...selectedNote,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleContentChange = (newContent: string) => {
    if (selectedNote) {
      updateNote({
        ...selectedNote,
        content: newContent,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar - Notes List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Notes</h2>
          
          {/* Buttons Container */}
          <div className="flex gap-2 mb-4">
            {/* Create Note Button */}
            <button
              onClick={createNewNote}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
            >
              <Plus className="w-5 h-5" />
              New
            </button>
            
            {/* Sync Completed Questions Button */}
            <button
              onClick={syncCompletedQuestions}
              disabled={completedQuestions.length === 0}
              title={completedQuestions.length === 0 ? "Mark questions as completed first" : "Sync notes for completed questions"}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-shadow font-medium ${
                completedQuestions.length > 0
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg cursor-pointer'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              Sync {completedQuestions.length > 0 ? `(${completedQuestions.length})` : '(0)'}
            </button>
          </div>

          {/* Sync Notification */}
          {showSyncNotification && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Notes synced successfully!
              </p>
            </div>
          )}

          {/* Search */}
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredNotes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-gray-500 dark:text-gray-400">No notes yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create your first note to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedNoteId === note.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <h3 className={`font-medium truncate ${
                    selectedNoteId === note.id
                      ? 'text-blue-900 dark:text-blue-300'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {note.title || 'Untitled'}
                  </h3>
                  <p className={`text-xs truncate mt-1 ${
                    selectedNoteId === note.id
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {note.content || 'No content'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    selectedNoteId === note.id
                      ? 'text-blue-600 dark:text-blue-500'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Note Editor */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex flex-col">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex items-center justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none w-full"
                  placeholder="Note title..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => deleteNote(selectedNote.id)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors flex-shrink-0"
                title="Delete note"
              >
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 px-8 py-6 overflow-y-auto">
              <textarea
                value={selectedNote.content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Start typing your note..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No note selected</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Select a note from the list or create a new one</p>
              <button
                onClick={createNewNote}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
