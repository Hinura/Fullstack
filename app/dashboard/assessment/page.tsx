'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useBirthdateCheck } from '@/hooks/useBirthdateCheck'
import { useEffect } from 'react'

type Subject = 'mathematics' | 'reading' | 'science'
type QuestionType = 'multiple_choice' | 'true_false'
type Difficulty = 'easy' | 'medium' | 'hard'

interface AssessmentQuestion {
  id: string
  subject: Subject
  question_type: QuestionType
  difficulty: Difficulty
  question_text: string
  options: string[]
  correct_answer: number
  points: number
}

interface AssessmentAnswer {
  questionId: string
  answer: number
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
  const [currentSubject, setCurrentSubject] = useState<Subject>('mathematics')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [skillLevels, setSkillLevels] = useState<{[key in Subject]: number}>({
    mathematics: 1,
    reading: 1,
    science: 1
  })

  // Hook must be called at the top level, before any conditional returns
  const { canAccess } = useBirthdateCheck({ user: userData, redirectTo: "/dashboard/assessment" })

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

  const subjects: Subject[] = ['mathematics', 'reading', 'science']
  const subjectNames = {
    mathematics: 'Mathematics',
    reading: 'Reading',
    science: 'Science'
  }
  const subjectEmojis = {
    mathematics: '🔢',
    reading: '📚',
    science: '🔬'
  }

  // Load questions for current subject
  const loadQuestionsForSubject = async (subject: Subject) => {
    try {
      // Get 6-8 questions per subject (2-3 of each difficulty)
      const { data: easyQuestions } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('subject', subject)
        .eq('difficulty', 'easy')
        .limit(2)
        .order('id')

      const { data: mediumQuestions } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('subject', subject)
        .eq('difficulty', 'medium')
        .limit(3)
        .order('id')

      const { data: hardQuestions } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('subject', subject)
        .eq('difficulty', 'hard')
        .limit(2)
        .order('id')

      const allQuestions = [
        ...(easyQuestions || []),
        ...(mediumQuestions || []),
        ...(hardQuestions || [])
      ]

      // Shuffle questions to randomize order
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5)
      setQuestions(shuffledQuestions)
      setCurrentQuestionIndex(0)
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }

  // Start assessment
  const startAssessment = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create assessment record
      const { data: assessment, error } = await supabase
        .from('user_assessments')
        .insert({
          user_id: user.id,
          current_subject: 'mathematics',
          current_question_index: 0
        })
        .select()
        .single()

      if (error) throw error

      setAssessmentId(assessment.id)
      setCurrentSubject('mathematics')
      await loadQuestionsForSubject('mathematics')
      setCurrentStep('assessment')
    } catch (error) {
      console.error('Error starting assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Submit answer
  const submitAnswer = async () => {
    if (selectedAnswer === null || !assessmentId) return

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correct_answer

    const newAnswer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect
    }

    setAnswers(prev => [...prev, newAnswer])

    // Save answer to database
    try {
      await supabase
        .from('user_assessment_answers')
        .insert({
          assessment_id: assessmentId,
          question_id: currentQuestion.id,
          user_answer: selectedAnswer,
          is_correct: isCorrect
        })
    } catch (error) {
      console.error('Error saving answer:', error)
    }

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
        await supabase
          .from('user_assessments')
          .update({
            current_subject: nextSubject,
            current_question_index: 0
          })
          .eq('id', assessmentId)
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
      if (!assessmentId) return

      // Call the complete assessment API
      const response = await fetch('/api/assessment/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId
        })
      })

      if (response.ok) {
        const result = await response.json()

        // Convert API response to frontend format
        const calculatedSkillLevels: {[key in Subject]: number} = {
          mathematics: result.skillLevels?.mathematics?.level || 1,
          reading: result.skillLevels?.reading?.level || 1,
          science: result.skillLevels?.science?.level || 1
        }

        setSkillLevels(calculatedSkillLevels)
        setCurrentStep('results')
      } else {
        console.error('Error completing assessment:', await response.text())
      }
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
                  {currentQuestion.difficulty} • {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                </div>
                <h2 className="text-2xl font-bold text-charcoal mb-6 leading-relaxed">
                  {currentQuestion.question_text}
                </h2>
              </div>

              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, index) => (
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
                Here are your skill levels. Don&apos;t worry - we&apos;ll help you improve in every area!
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
                  onClick={() => router.push('/dashboard/learn?welcome=true')}
                  className="h-14 px-12 text-lg font-bold bg-gradient-to-r from-warm-green to-coral hover:from-warm-green/90 hover:to-coral/90 text-cream rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                >
                  Start Learning Journey
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