export type StepKeyword = 'Given' | 'When' | 'Then' | 'And' | 'But'
export type Line = string

export type Background = {
  given: string
  and: string[]
}

export type Scenario = {
  id: string
  name: string
  userTags: string[]
  description?: string   // NEW
  steps: {
    given: string
    andGiven: string[]
    when: string
    andWhen: string[]
    then: string
    andThen: string[]
  }
  isOutline?: false
}

export type Examples = { headers: string[]; rows: string[][] }

export type ScenarioOutline = {
  id: string
  name: string
  userTags: string[]
  description?: string   // NEW
  steps: Scenario['steps']
  isOutline: true
  examples: Examples
}

export type ScenarioLike = Scenario | ScenarioOutline

export type Feature = {
  title: string
  description?: string   // already existed; keep and use it
  background?: Background
  scenarios: ScenarioLike[]
}

export const uuid = () => Math.random().toString(36).slice(2, 10)

export function seedFeature(): Feature {
  return {
    title: 'Feature: New feature',
    description: 'As a user, I want a starting point.',
    background: {
      given: 'Given the app is open',
      and: []
    },
    scenarios: [{
      id: uuid(),
      name: 'Seed scenario',
      userTags: [],
      description: 'Short scenario description explaining intent.', // NEW
      steps: {
        given: 'Given a precondition',
        andGiven: [],
        when: 'When an action happens',
        andWhen: [],
        then: 'Then an outcome is shown',
        andThen: []
      },
      isOutline: false
    }]
  }
}