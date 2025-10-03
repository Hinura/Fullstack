"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"
import DashboardNavigation from "@/components/DashboardNavigation"

interface Question {
  id: string
  subject: string
  age_group: number
  difficulty: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  answer: string
}

interface QuizState {
  currentQuestion: number
  selectedAnswers: (string | null)[]
  score: number
  isComplete: boolean
}

function PracticeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const subject = searchParams.get('subject')
  const difficulty = searchParams.get('difficulty') || 'adaptive'

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswers: [],
    score: 0,
    isComplete: false
  })
  const [showFeedback, setShowFeedback] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    if (!subject) {
      router.push('/dashboard/learn')
      return
    }
    fetchQuestions()
    setStartTime(Date.now())
  }, [subject, difficulty])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/questions?subject=${subject}&difficulty=${difficulty}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
        setQuizState(prev => ({
          ...prev,
          selectedAnswers: new Array(data.questions.length).fill(null)
        }))
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...quizState.selectedAnswers]
    newAnswers[quizState.currentQuestion] = answer
    setQuizState(prev => ({ ...prev, selectedAnswers: newAnswers }))
  }

  const saveQuizAttempt = async (correctAnswers: number, timeSpentSeconds: number) => {
    try {
      await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          difficulty,
          total_questions: questions.length,
          correct_answers: correctAnswers,
          time_spent_seconds: timeSpentSeconds
        })
      })
    } catch (error) {
      console.error('Error saving quiz attempt:', error)
    }
  }

  const handleNext = () => {
    setShowFeedback(true)

    setTimeout(() => {
      if (quizState.currentQuestion < questions.length - 1) {
        setQuizState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1
        }))
        setShowFeedback(false)
      } else {
        // Calculate final score
        const score = quizState.selectedAnswers.reduce((acc, answer, idx) => {
          return acc + (answer === questions[idx].answer ? 1 : 0)
        }, 0)

        // Calculate time spent
        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)

        // Save quiz attempt to database
        saveQuizAttempt(score, timeSpentSeconds)

        setQuizState(prev => ({ ...prev, score, isComplete: true }))
      }
    }, 1500)
  }

  const currentQ = questions[quizState.currentQuestion]
  const selectedAnswer = quizState.selectedAnswers[quizState.currentQuestion]
  const isCorrect = selectedAnswer === currentQ?.answer

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'math': return { bg: 'coral', icon: '🔢' }
      case 'english': return { bg: 'sage-blue', icon: '📚' }
      case 'science': return { bg: 'warm-green', icon: '🔬' }
      default: return { bg: 'coral', icon: '📝' }
    }
  }

  const subjectInfo = getSubjectColor(subject || '')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-4 bg-cream/80 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-coral" />
            <span className="text-xl font-medium text-charcoal">Loading questions...</span>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Alert className="border-2 border-coral/30 bg-coral/10">
            <AlertDescription className="text-charcoal">
              No questions found for this subject and difficulty level. Please try a different combination.
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/dashboard/learn')} className="mt-4">
            Back to Learning Hub
          </Button>
        </div>
      </div>
    )
  }

  if (quizState.isComplete) {
    const percentage = Math.round((quizState.score / questions.length) * 100)

    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <DashboardNavigation />
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-cream/95 rounded-3xl p-8 shadow-soft text-center">
            <div className={`w-24 h-24 bg-gradient-to-br from-${subjectInfo.bg} to-${subjectInfo.bg}/70 rounded-full flex items-center justify-center mx-auto mb-6`}>
              <span className="text-5xl">{percentage >= 70 ? '🎉' : '💪'}</span>
            </div>

            <h1 className="text-4xl font-bold text-charcoal mb-4">
              {percentage >= 70 ? 'Great Job!' : 'Keep Practicing!'}
            </h1>

            <div className="mb-8">
              <div className="text-6xl font-bold text-coral mb-2">{percentage}%</div>
              <p className="text-xl text-charcoal/70">
                You got {quizState.score} out of {questions.length} questions correct
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-warm-green/10 rounded-xl">
                <div className="text-3xl font-bold text-warm-green">{quizState.score}</div>
                <div className="text-sm text-charcoal/60">Correct</div>
              </div>
              <div className="p-4 bg-coral/10 rounded-xl">
                <div className="text-3xl font-bold text-coral">{questions.length - quizState.score}</div>
                <div className="text-sm text-charcoal/60">Incorrect</div>
              </div>
              <div className="p-4 bg-sage-blue/10 rounded-xl">
                <div className="text-3xl font-bold text-sage-blue">+{quizState.score * 10}</div>
                <div className="text-sm text-charcoal/60">Points</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/dashboard/learn')}
                className="bg-sage-blue hover:bg-sage-blue/90 text-cream"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Learning Hub
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className={`bg-gradient-to-r from-${subjectInfo.bg} to-${subjectInfo.bg}/70 text-cream`}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
      <DashboardNavigation />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/learn')}
            className="text-charcoal/70 hover:text-charcoal"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Practice
          </Button>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-charcoal/60">
              Question {quizState.currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-sage-blue/10 rounded-full h-2">
            <div
              className={`bg-gradient-to-r from-${subjectInfo.bg} to-${subjectInfo.bg}/70 h-2 rounded-full transition-all duration-500`}
              style={{ width: `${((quizState.currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-cream/95 rounded-3xl p-8 shadow-soft mb-6">
          <div className="flex items-start mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br from-${subjectInfo.bg} to-${subjectInfo.bg}/70 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0`}>
              <span className="text-2xl">{subjectInfo.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-charcoal/60 capitalize">{currentQ.subject}</span>
                <span className="mx-2 text-charcoal/40">•</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  currentQ.difficulty === 'easy' ? 'bg-warm-green/20 text-warm-green' :
                  currentQ.difficulty === 'medium' ? 'bg-sage-blue/20 text-sage-blue' :
                  'bg-coral/20 text-coral'
                }`}>
                  {currentQ.difficulty}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-charcoal leading-relaxed">
                {currentQ.question}
              </h2>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {['option_a', 'option_b', 'option_c', 'option_d'].map((key, idx) => {
              const optionValue = currentQ[key as keyof Question] as string
              const optionLetter = String.fromCharCode(65 + idx) // A, B, C, D
              const isSelected = selectedAnswer === optionValue
              const showResult = showFeedback && isSelected

              return (
                <button
                  key={key}
                  onClick={() => !showFeedback && handleAnswerSelect(optionValue)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                    showResult && isCorrect ? 'border-warm-green bg-warm-green/10' :
                    showResult && !isCorrect ? 'border-coral bg-coral/10' :
                    isSelected ? `border-${subjectInfo.bg} bg-${subjectInfo.bg}/10` :
                    'border-sage-blue/20 hover:border-sage-blue/40 bg-sage-blue/5'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-102'}`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold ${
                      showResult && isCorrect ? 'bg-warm-green text-cream' :
                      showResult && !isCorrect ? 'bg-coral text-cream' :
                      isSelected ? `bg-${subjectInfo.bg} text-cream` :
                      'bg-sage-blue/20 text-charcoal'
                    }`}>
                      {showResult ? (isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />) : optionLetter}
                    </div>
                    <span className="text-charcoal font-medium">{optionValue}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Feedback Message */}
        {showFeedback && (
          <Alert className={`mb-6 border-2 ${isCorrect ? 'border-warm-green/30 bg-warm-green/10' : 'border-coral/30 bg-coral/10'}`}>
            <AlertDescription className={isCorrect ? 'text-warm-green' : 'text-coral'}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                <div>
                  <p className="font-bold">
                    {isCorrect ? 'Correct!' : 'Not quite right'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm">The correct answer is: {currentQ.answer}</p>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!selectedAnswer || showFeedback}
          className={`w-full bg-gradient-to-r from-${subjectInfo.bg} to-${subjectInfo.bg}/70 text-cream text-lg py-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {quizState.currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
        </Button>
      </div>
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    }>
      <PracticeContent />
    </Suspense>
  )
}
