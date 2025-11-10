'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useBirthdateCheck } from '@/hooks/useBirthdateCheck'
import { useCheckAchievements } from '@/components/gamification/AchievementProvider'

type Subject = 'math' | 'english' | 'science'
type Difficulty = 'easy' | 'medium' | 'hard'

interface AssessmentQuestion {
  id: string
  subject: string
  age: number
  difficulty: Difficulty
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  answer: string
}

interface AssessmentAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
}

interface UserData {
  id: string
  email: string
  fullName: string
  birthdate?: string
  age?: number
}

export default function AssessmentPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [currentStep, setCurrentStep] = useState<'welcome' | 'assessment' | 'results'>('welcome')
  const [currentSubject, setCurrentSubject] = useState<Subject>('math')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [skillLevels, setSkillLevels] = useState<{[key in Subject]: number}>({
    math: 1,
    english: 1,
    science: 1
  })
  const [assessmentResults, setAssessmentResults] = useState<{[key in Subject]?: {correct: number, total: number, percentage: number}}>({})


  // Hook must be called at the top level, before any conditional returns
  const { canAccess } = useBirthdateCheck({ user: userData, redirectTo: "/dashboard/assessment" })

  // Achievement system
  const { checkAchievements } = useCheckAchievements()

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/dashboard/data")
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [])

  // Check if user has already completed assessment
  useEffect(() => {
    const checkAssessmentCompletion = async () => {
      try {
        const { data: assessmentAttempts, error } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('attempt_type', 'assessment')

        if (!error && assessmentAttempts && assessmentAttempts.length >= 3) {
          // User has completed assessment for all three subjects
          const existingResults: {[key in Subject]?: {correct: number, total: number, percentage: number}} = {}
          const existingSkillLevels: {[key in Subject]: number} = {
            math: 1,
            english: 1,
            science: 1
          }

          assessmentAttempts.forEach((attempt) => {
            const subject = attempt.subject as Subject
            const percentage = attempt.score_percentage || 0

            existingResults[subject] = {
              correct: attempt.correct_answers,
              total: attempt.total_questions,
              percentage: Math.round(percentage)
            }

            // Convert percentage to skill level (1-5)
            if (percentage >= 85) existingSkillLevels[subject] = 5
            else if (percentage >= 70) existingSkillLevels[subject] = 4
            else if (percentage >= 55) existingSkillLevels[subject] = 3
            else if (percentage >= 40) existingSkillLevels[subject] = 2
            else existingSkillLevels[subject] = 1
          })

          setAssessmentResults(existingResults)
          setSkillLevels(existingSkillLevels)
          setCurrentStep('results')
        }
      } catch (error) {
        console.error("Error checking assessment completion:", error)
      }
    }

    checkAssessmentCompletion()
  }, [supabase])

  // If user needs to set birthdate, redirect to dashboard
  if (!canAccess && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-4 bg-cream/80 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-coral" />
            <span className="text-xl font-medium text-charcoal">Redirecting...</span>
          </div>
        </div>
      </div>
    )
  }

  const subjects: Subject[] = ['math', 'english', 'science']
  const subjectNames = {
    math: 'Mathematics',
    english: 'Reading',
    science: 'Science'
  }
  const subjectEmojis = {
    math: '🔢',
    english: '📚',
    science: '🔬'
  }

  // Load questions for current subject
  const loadQuestionsForSubject = async (subject: Subject) => {
    try {
      // Fetch questions from API (2 easy, 3 medium, 2 hard = 7 questions per subject)
      const response = await fetch(`/api/assessment/questions?subject=${subject}`)

      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const data = await response.json()
      setQuestions(data.questions || [])
      setCurrentQuestionIndex(0)
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }

  // Start assessment
  const startAssessment = async () => {
    setIsLoading(true)
    try {
      setCurrentSubject('math')
      await loadQuestionsForSubject('math')
      setCurrentStep('assessment')
    } catch (error) {
      console.error('Error starting assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Submit answer
  const submitAnswer = async () => {
    if (selectedAnswer === null) return

    const currentQuestion = questions[currentQuestionIndex]
    // Convert number answer (0,1,2,3) to letter answer (A,B,C,D)
    const answerLetter = ['A', 'B', 'C', 'D'][selectedAnswer]
    const isCorrect = answerLetter === currentQuestion.answer

    const newAnswer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      answer: answerLetter,
      isCorrect
    }

    setAnswers(prev => [...prev, newAnswer])
    setSelectedAnswer(null)

    // Move to next question or subject
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Move to next subject or finish assessment
      const currentSubjectIndex = subjects.indexOf(currentSubject)
      if (currentSubjectIndex < subjects.length - 1) {
        const nextSubject = subjects[currentSubjectIndex + 1]
        setCurrentSubject(nextSubject)
        await loadQuestionsForSubject(nextSubject)
      } else {
        // Finish assessment
        await finishAssessment()
      }
    }
  }

  // Calculate skill levels and finish assessment
  const finishAssessment = async () => {
    try {
      // Calculate results per subject
      const results: {[key in Subject]?: {correct: number, total: number}} = {}

      // We need to track which questions belong to which subject
      // For now, assume 7 questions per subject in order: math, english, science
      const questionsPerSubject = 7

      subjects.forEach((subject, subjectIndex) => {
        const subjectAnswers = answers.slice(
          subjectIndex * questionsPerSubject,
          (subjectIndex + 1) * questionsPerSubject
        )

        const correct = subjectAnswers.filter(a => a.isCorrect).length
        results[subject] = {
          correct,
          total: subjectAnswers.length
        }
      })

      // Save results to database
      const response = await fetch('/api/assessment/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`Failed to save assessment results: ${errorData.error || response.statusText}`)
      }

      // Calculate skill levels based on percentage (1-5 scale)
      const calculatedSkillLevels: {[key in Subject]: number} = {
        math: 1,
        english: 1,
        science: 1
      }

      const calculatedResults: {[key in Subject]?: {correct: number, total: number, percentage: number}} = {}

      subjects.forEach(subject => {
        if (results[subject]) {
          const percentage = (results[subject]!.correct / results[subject]!.total) * 100

          calculatedResults[subject] = {
            correct: results[subject]!.correct,
            total: results[subject]!.total,
            percentage: Math.round(percentage)
          }

          // Convert percentage to skill level (1-5)
          if (percentage >= 85) calculatedSkillLevels[subject] = 5
          else if (percentage >= 70) calculatedSkillLevels[subject] = 4
          else if (percentage >= 55) calculatedSkillLevels[subject] = 3
          else if (percentage >= 40) calculatedSkillLevels[subject] = 2
          else calculatedSkillLevels[subject] = 1
        }
      })

      setAssessmentResults(calculatedResults)
      setSkillLevels(calculatedSkillLevels)
      setCurrentStep('results')

      // Check for achievements after assessment completion
      // Small delay to ensure results screen is rendered
      setTimeout(() => {
        checkAchievements()
      }, 800)
    } catch (error) {
      console.error('Error finishing assessment:', error)
    }
  }

  // Get total progress
  const getTotalProgress = () => {
    const currentSubjectIndex = subjects.indexOf(currentSubject)
    const questionsPerSubject = questions.length || 7 // Default estimate
    const totalQuestions = subjects.length * questionsPerSubject
    const completedQuestions = (currentSubjectIndex * questionsPerSubject) + currentQuestionIndex
    return Math.round((completedQuestions / totalQuestions) * 100)
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="shadow-2xl border-2 border-warm-green/20 bg-cream/95 backdrop-blur-md rounded-3xl">
            <CardHeader className="text-center pb-8 pt-12">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-warm-green to-coral flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl">🎯</span>
              </div>
              <CardTitle className="text-4xl font-bold text-charcoal mb-4">
                Welcome to Your Learning Assessment!
              </CardTitle>
              <CardDescription className="text-xl text-charcoal/70 leading-relaxed max-w-2xl mx-auto">
                Let&apos;s discover your current skill level to personalize your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="px-12 pb-12">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-coral/10 to-warm-green/10 rounded-2xl border border-coral/20">
                  <div className="w-16 h-16 bg-coral/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔢</span>
                  </div>
                  <h3 className="font-bold text-charcoal mb-2">Mathematics</h3>
                  <p className="text-sm text-charcoal/60">Basic arithmetic, algebra, and problem solving</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-sage-blue/10 to-warm-green/10 rounded-2xl border border-sage-blue/20">
                  <div className="w-16 h-16 bg-sage-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h3 className="font-bold text-charcoal mb-2">Reading</h3>
                  <p className="text-sm text-charcoal/60">Vocabulary, grammar, and comprehension</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-warm-green/10 to-coral/10 rounded-2xl border border-warm-green/20">
                  <div className="w-16 h-16 bg-warm-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔬</span>
                  </div>
                  <h3 className="font-bold text-charcoal mb-2">Science</h3>
                  <p className="text-sm text-charcoal/60">Biology, chemistry, and physics basics</p>
                </div>
              </div>

              <div className="bg-sage-blue/10 rounded-2xl p-6 mb-8 border border-sage-blue/20">
                <h4 className="font-bold text-charcoal mb-4 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  What to Expect
                </h4>
                <ul className="space-y-2 text-charcoal/70">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-warm-green rounded-full mr-3"></span>
                    About 6-8 questions per subject (18-24 total)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-coral rounded-full mr-3"></span>
                    Questions will get easier or harder based on your answers
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-sage-blue rounded-full mr-3"></span>
                    Takes about 10-15 minutes to complete
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-warm-green rounded-full mr-3"></span>
                    Your results will personalize your learning experience
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Button
                  onClick={startAssessment}
                  disabled={isLoading}
                  className="w-full md:w-auto h-14 px-12 text-lg font-bold bg-gradient-to-r from-warm-green to-coral hover:from-warm-green/90 hover:to-coral/90 text-cream rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Starting Assessment...
                    </>
                  ) : (
                    'Start My Assessment'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === 'assessment' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-charcoal">
                {subjectEmojis[currentSubject]} {subjectNames[currentSubject]} Assessment
              </h1>
              <div className="text-sm text-charcoal/60">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
            <Progress value={getTotalProgress()} className="h-2" />
            <div className="text-sm text-charcoal/60 mt-2">
              Overall Progress: {getTotalProgress()}%
            </div>
          </div>

          <Card className="shadow-xl border-2 border-warm-green/20 bg-cream/95 backdrop-blur-md rounded-3xl">
            <CardContent className="p-8">
              <div className="mb-8">
                <div className="text-sm text-coral font-medium mb-4 uppercase tracking-wide">
                  {currentQuestion.difficulty}
                </div>
                <h2 className="text-2xl font-bold text-charcoal mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="space-y-4 mb-8">
                {[currentQuestion.option_a, currentQuestion.option_b, currentQuestion.option_c, currentQuestion.option_d].map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                      selectedAnswer === index
                        ? 'border-coral bg-coral/10'
                        : 'border-sage-blue/20 bg-sage-blue/5 hover:border-sage-blue/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={index}
                      checked={selectedAnswer === index}
                      onChange={() => setSelectedAnswer(index)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-coral bg-coral'
                        : 'border-sage-blue/30'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-3 h-3 bg-cream rounded-full"></div>
                      )}
                    </div>
                    <span className="text-lg text-charcoal font-medium">{option}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-charcoal/60">
                  Subject {subjects.indexOf(currentSubject) + 1} of {subjects.length}
                </div>
                <Button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null}
                  className="h-12 px-8 text-lg font-bold bg-gradient-to-r from-coral to-warm-green hover:from-coral/90 hover:to-warm-green/90 text-cream rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {currentQuestionIndex === questions.length - 1 && subjects.indexOf(currentSubject) === subjects.length - 1
                    ? 'Finish Assessment'
                    : 'Next Question'
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage-blue/5 to-coral/5">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="shadow-2xl border-2 border-warm-green/20 bg-cream/95 backdrop-blur-md rounded-3xl">
            <CardHeader className="text-center pb-8 pt-12">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-warm-green to-coral flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl">🎉</span>
              </div>
              <CardTitle className="text-4xl font-bold text-charcoal mb-4">
                Assessment Complete!
              </CardTitle>
              <CardDescription className="text-xl text-charcoal/70 leading-relaxed max-w-2xl mx-auto">
                {currentStep === 'results' && currentQuestionIndex === 0 && questions.length === 0
                  ? "You've already completed your initial assessment. Here are your results!"
                  : "Here are your skill levels. Don't worry - we'll help you improve in every area!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-12 pb-12">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {subjects.map(subject => (
                  <div key={subject} className="text-center p-6 bg-gradient-to-br from-sage-blue/10 to-warm-green/10 rounded-2xl border border-sage-blue/20">
                    <div className="w-20 h-20 bg-gradient-to-br from-coral to-warm-green rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-3xl">{subjectEmojis[subject]}</span>
                    </div>
                    <h3 className="text-xl font-bold text-charcoal mb-2">{subjectNames[subject]}</h3>
                    <div className="flex items-center justify-center mb-2">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className={`w-4 h-4 rounded-full mx-1 ${
                            level <= skillLevels[subject]
                              ? 'bg-gradient-to-r from-coral to-warm-green'
                              : 'bg-sage-blue/20'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-lg font-semibold text-coral">
                      Level {skillLevels[subject]} of 5
                    </p>
                    {assessmentResults[subject] && (
                      <p className="text-sm font-medium text-charcoal/80 mt-2 mb-1">
                        {assessmentResults[subject]!.correct} of {assessmentResults[subject]!.total} correct ({assessmentResults[subject]!.percentage}%)
                      </p>
                    )}
                    <p className="text-sm text-charcoal/60 mt-1">
                      {skillLevels[subject] === 1 && 'Beginner - Let&apos;s start with the basics!'}
                      {skillLevels[subject] === 2 && 'Elementary - Building your foundation'}
                      {skillLevels[subject] === 3 && 'Intermediate - You&apos;re making progress!'}
                      {skillLevels[subject] === 4 && 'Advanced - Great understanding!'}
                      {skillLevels[subject] === 5 && 'Expert - Excellent mastery!'}
                    </p>
                  </div>
                ))}
              </div>

              <Alert className="mb-8 border-2 border-warm-green/30 bg-warm-green/10">
                <AlertDescription className="text-warm-green/90">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h4 className="font-bold mb-2">Your Learning Journey Starts Now!</h4>
                      <p>
                        Based on your assessment results, we&apos;ve personalized your learning path.
                        The adaptive algorithm will adjust the difficulty of questions and content
                        to match your skill level in each subject, ensuring you&apos;re always challenged
                        but never overwhelmed.
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <Button
                  onClick={() => router.push(currentStep === 'results' && currentQuestionIndex === 0 && questions.length === 0 ? '/dashboard' : '/dashboard/learn?welcome=true')}
                  className="h-14 px-12 text-lg font-bold bg-gradient-to-r from-warm-green to-coral hover:from-warm-green/90 hover:to-coral/90 text-cream rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                >
                  {currentStep === 'results' && currentQuestionIndex === 0 && questions.length === 0
                    ? 'Go to Dashboard'
                    : 'Start Learning Journey'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}