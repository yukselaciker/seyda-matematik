/**
 * FlashcardGame.tsx - Interactive Flashcard Study Center
 * 
 * Features:
 * - Create and manage multiple decks
 * - Flip cards with 3D CSS transform
 * - Track mastery level (knew it / study again)
 * - Persist all data to localStorage
 * - Spaced repetition hints
 */

import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Layers, Plus, Play, RotateCcw, Check, X, Edit3, Trash2, 
  ChevronLeft, ChevronRight, Sparkles, Trophy, BookOpen,
  Zap, Target, Clock
} from 'lucide-react';

// --- TYPES ---
interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastery: number; // 0-100
  lastReviewed: string | null;
  timesCorrect: number;
  timesIncorrect: number;
}

interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  color: string;
  cards: Flashcard[];
  createdAt: string;
}

type ViewMode = 'decks' | 'study' | 'edit';

// --- CONSTANTS ---
const STORAGE_KEY = 'app_flashcard_decks';

const DECK_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-yellow-600',
];

const DEFAULT_DECKS: FlashcardDeck[] = [
  {
    id: 'deck_1',
    name: 'Matematik Formülleri',
    description: 'Temel matematik formülleri ve kuralları',
    color: 'from-indigo-500 to-purple-600',
    createdAt: new Date().toISOString(),
    cards: [
      { id: 'c1', front: 'Pisagor Teoremi', back: 'a² + b² = c²', mastery: 0, lastReviewed: null, timesCorrect: 0, timesIncorrect: 0 },
      { id: 'c2', front: 'Çemberin Alanı', back: 'A = πr²', mastery: 0, lastReviewed: null, timesCorrect: 0, timesIncorrect: 0 },
      { id: 'c3', front: 'Üçgenin Alanı', back: 'A = (taban × yükseklik) / 2', mastery: 0, lastReviewed: null, timesCorrect: 0, timesIncorrect: 0 },
      { id: 'c4', front: 'Kare Alma Formülü', back: '(a + b)² = a² + 2ab + b²', mastery: 0, lastReviewed: null, timesCorrect: 0, timesIncorrect: 0 },
    ]
  },
  {
    id: 'deck_2',
    name: 'İngilizce Kelimeler',
    description: 'Günlük hayatta kullanılan kelimeler',
    color: 'from-emerald-500 to-teal-600',
    createdAt: new Date().toISOString(),
    cards: [
      { id: 'c5', front: 'Accomplish', back: 'Başarmak, tamamlamak', mastery: 0, lastReviewed: null, timesCorrect: 0, timesIncorrect: 0 },
      { id: 'c6', front: 'Determine', back: 'Belirlemek, saptamak', mastery: 0, lastReviewed: null, timesCorrect: 0, timesIncorrect: 0 },
      { id: 'c7', front: 'Enhance', back: 'Geliştirmek, artırmak', mastery: 0, lastReviewed: null, timesCorrect: 0, timesIncorrect: 0 },
    ]
  }
];

// --- STORAGE HELPERS ---
const getStoredDecks = (): FlashcardDeck[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load flashcard decks', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DECKS));
  return DEFAULT_DECKS;
};

const saveDecks = (decks: FlashcardDeck[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch (e) {
    console.error('Failed to save flashcard decks', e);
  }
};

// --- FLASHCARD COMPONENT (with 3D flip) ---
interface FlashcardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}

const FlashcardDisplay: React.FC<FlashcardProps> = memo(({ card, isFlipped, onFlip }) => (
  <div 
    className="relative w-full max-w-md h-64 cursor-pointer perspective-1000"
    onClick={onFlip}
  >
    <div 
      className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
        isFlipped ? 'rotate-y-180' : ''
      }`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Front */}
      <div 
        className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 text-white"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <Zap className="w-8 h-8 mb-4 opacity-50" />
        <p className="text-xl font-bold text-center">{card.front}</p>
        <p className="text-sm mt-4 opacity-70">Cevabı görmek için tıkla</p>
      </div>
      
      {/* Back */}
      <div 
        className="absolute inset-0 backface-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 text-white rotate-y-180"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <Check className="w-8 h-8 mb-4 opacity-50" />
        <p className="text-xl font-bold text-center">{card.back}</p>
      </div>
    </div>
  </div>
));

FlashcardDisplay.displayName = 'FlashcardDisplay';

// --- CREATE DECK MODAL ---
interface CreateDeckModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

const CreateDeckModal: React.FC<CreateDeckModalProps> = memo(({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Yeni Deste Oluştur</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deste Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="örn: Matematik Formülleri"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama (opsiyonel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Bu deste hakkında kısa bir açıklama..."
              rows={2}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CreateDeckModal.displayName = 'CreateDeckModal';

// --- ADD CARD MODAL ---
interface AddCardModalProps {
  onClose: () => void;
  onAdd: (front: string, back: string) => void;
}

const AddCardModal: React.FC<AddCardModalProps> = memo(({ onClose, onAdd }) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onAdd(front.trim(), back.trim());
      setFront('');
      setBack('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Yeni Kart Ekle</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ön Yüz (Soru)</label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Soru veya terim..."
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Arka Yüz (Cevap)</label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Cevap veya tanım..."
              rows={2}
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Kapat
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ekle & Devam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

AddCardModal.displayName = 'AddCardModal';

// --- MAIN FLASHCARD GAME COMPONENT ---
export const FlashcardGame: React.FC = memo(() => {
  const [decks, setDecks] = useState<FlashcardDeck[]>(getStoredDecks);
  const [viewMode, setViewMode] = useState<ViewMode>('decks');
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0 });

  // Save decks whenever they change
  useEffect(() => {
    saveDecks(decks);
  }, [decks]);

  // Create new deck
  const handleCreateDeck = useCallback((name: string, description: string) => {
    const newDeck: FlashcardDeck = {
      id: `deck_${Date.now()}`,
      name,
      description,
      color: DECK_COLORS[decks.length % DECK_COLORS.length],
      cards: [],
      createdAt: new Date().toISOString(),
    };
    setDecks(prev => [...prev, newDeck]);
  }, [decks.length]);

  // Delete deck
  const handleDeleteDeck = useCallback((deckId: string) => {
    if (window.confirm('Bu desteyi silmek istediğinize emin misiniz?')) {
      setDecks(prev => prev.filter(d => d.id !== deckId));
    }
  }, []);

  // Add card to deck
  const handleAddCard = useCallback((front: string, back: string) => {
    if (!selectedDeck) return;
    
    const newCard: Flashcard = {
      id: `card_${Date.now()}`,
      front,
      back,
      mastery: 0,
      lastReviewed: null,
      timesCorrect: 0,
      timesIncorrect: 0,
    };

    setDecks(prev => prev.map(deck => 
      deck.id === selectedDeck.id 
        ? { ...deck, cards: [...deck.cards, newCard] }
        : deck
    ));
    
    // Update selected deck reference
    setSelectedDeck(prev => prev ? { ...prev, cards: [...prev.cards, newCard] } : null);
  }, [selectedDeck]);

  // Delete card
  const handleDeleteCard = useCallback((cardId: string) => {
    if (!selectedDeck) return;
    
    setDecks(prev => prev.map(deck => 
      deck.id === selectedDeck.id 
        ? { ...deck, cards: deck.cards.filter(c => c.id !== cardId) }
        : deck
    ));
    
    setSelectedDeck(prev => prev ? { ...prev, cards: prev.cards.filter(c => c.id !== cardId) } : null);
  }, [selectedDeck]);

  // Start studying a deck
  const handleStartStudy = useCallback((deck: FlashcardDeck) => {
    if (deck.cards.length === 0) {
      alert('Bu destede henüz kart yok. Önce kart ekleyin!');
      return;
    }
    setSelectedDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyStats({ correct: 0, incorrect: 0 });
    setViewMode('study');
  }, []);

  // Handle card answer
  const handleAnswer = useCallback((correct: boolean) => {
    if (!selectedDeck) return;

    const currentCard = selectedDeck.cards[currentCardIndex];
    
    // Update card stats
    setDecks(prev => prev.map(deck => 
      deck.id === selectedDeck.id 
        ? {
            ...deck,
            cards: deck.cards.map(card => 
              card.id === currentCard.id
                ? {
                    ...card,
                    mastery: correct 
                      ? Math.min(100, card.mastery + 20)
                      : Math.max(0, card.mastery - 10),
                    lastReviewed: new Date().toISOString(),
                    timesCorrect: correct ? card.timesCorrect + 1 : card.timesCorrect,
                    timesIncorrect: correct ? card.timesIncorrect : card.timesIncorrect + 1,
                  }
                : card
            )
          }
        : deck
    ));

    // Update study stats
    setStudyStats(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
    }));

    // Move to next card
    if (currentCardIndex < selectedDeck.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Study session complete
      setViewMode('decks');
      setSelectedDeck(null);
    }
  }, [selectedDeck, currentCardIndex]);

  // Edit deck view
  const handleEditDeck = useCallback((deck: FlashcardDeck) => {
    setSelectedDeck(deck);
    setViewMode('edit');
  }, []);

  // Calculate deck mastery
  const getDeckMastery = useCallback((deck: FlashcardDeck): number => {
    if (deck.cards.length === 0) return 0;
    const totalMastery = deck.cards.reduce((sum, card) => sum + card.mastery, 0);
    return Math.round(totalMastery / deck.cards.length);
  }, []);

  // --- RENDER DECKS VIEW ---
  const renderDecksView = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" />
            Flashcard Merkezi
          </h2>
          <p className="text-slate-500 mt-1">Kartlarınla çalış, bilgini test et!</p>
        </div>
        <button
          onClick={() => setShowCreateDeck(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Yeni Deste
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <BookOpen className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{decks.length}</p>
          <p className="text-sm opacity-80">Toplam Deste</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
          <Layers className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{decks.reduce((sum, d) => sum + d.cards.length, 0)}</p>
          <p className="text-sm opacity-80">Toplam Kart</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
          <Trophy className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">
            {decks.length > 0 ? Math.round(decks.reduce((sum, d) => sum + getDeckMastery(d), 0) / decks.length) : 0}%
          </p>
          <p className="text-sm opacity-80">Ortalama Hakimiyet</p>
        </div>
      </div>

      {/* Decks Grid */}
      {decks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz deste yok</h3>
          <p className="text-slate-500 mb-4">İlk desteni oluşturarak başla!</p>
          <button
            onClick={() => setShowCreateDeck(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Deste Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map(deck => {
            const mastery = getDeckMastery(deck);
            return (
              <div 
                key={deck.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className={`h-2 bg-gradient-to-r ${deck.color}`} />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {deck.name}
                      </h3>
                      <p className="text-sm text-slate-500">{deck.cards.length} kart</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditDeck(deck)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {deck.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{deck.description}</p>
                  )}

                  {/* Mastery Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Hakimiyet</span>
                      <span>{mastery}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${deck.color} transition-all duration-500`}
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartStudy(deck)}
                    disabled={deck.cards.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                    Çalışmaya Başla
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Deck Modal */}
      {showCreateDeck && (
        <CreateDeckModal
          onClose={() => setShowCreateDeck(false)}
          onCreate={handleCreateDeck}
        />
      )}
    </div>
  );

  // --- RENDER STUDY VIEW ---
  const renderStudyView = () => {
    if (!selectedDeck || selectedDeck.cards.length === 0) return null;
    
    const currentCard = selectedDeck.cards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / selectedDeck.cards.length) * 100;

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setViewMode('decks');
              setSelectedDeck(null);
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Destelere Dön
          </button>
          <div className="text-center">
            <h3 className="font-bold text-slate-800">{selectedDeck.name}</h3>
            <p className="text-sm text-slate-500">
              Kart {currentCardIndex + 1} / {selectedDeck.cards.length}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <Check className="w-4 h-4" /> {studyStats.correct}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <X className="w-4 h-4" /> {studyStats.incorrect}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard */}
        <div className="flex justify-center py-8">
          <FlashcardDisplay
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </div>

        {/* Answer Buttons */}
        {isFlipped && (
          <div className="flex justify-center gap-4 animate-fadeIn">
            <button
              onClick={() => handleAnswer(false)}
              className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Tekrar Çalış
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg"
            >
              <Check className="w-5 h-5" />
              Biliyordum!
            </button>
          </div>
        )}

        {/* Hint */}
        {!isFlipped && (
          <p className="text-center text-slate-400 text-sm">
            💡 Karta tıklayarak cevabı gör
          </p>
        )}
      </div>
    );
  };

  // --- RENDER EDIT VIEW ---
  const renderEditView = () => {
    if (!selectedDeck) return null;

    // Get updated deck from state
    const currentDeck = decks.find(d => d.id === selectedDeck.id) || selectedDeck;

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setViewMode('decks');
              setSelectedDeck(null);
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Destelere Dön
          </button>
          <h3 className="font-bold text-slate-800">{currentDeck.name} - Düzenle</h3>
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Kart Ekle
          </button>
        </div>

        {/* Cards List */}
        {currentDeck.cards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz kart yok</h3>
            <p className="text-slate-500 mb-4">İlk kartını ekleyerek başla!</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Kart Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDeck.cards.map((card, index) => (
              <div 
                key={card.id}
                className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{card.front}</p>
                    <p className="text-sm text-slate-500 truncate">{card.back}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-400">
                      Hakimiyet: {card.mastery}%
                    </div>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${card.mastery}%` }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Card Modal */}
        {showAddCard && (
          <AddCardModal
            onClose={() => setShowAddCard(false)}
            onAdd={handleAddCard}
          />
        )}
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
      
      {viewMode === 'decks' && renderDecksView()}
      {viewMode === 'study' && renderStudyView()}
      {viewMode === 'edit' && renderEditView()}
    </div>
  );
});

FlashcardGame.displayName = 'FlashcardGame';

export default FlashcardGame;




