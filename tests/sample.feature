Feature: Sample feature

feature tests the brake function behavior

Background:
  Given system x boots up
  And system y boots up

@scenario.1
Scenario Outline: car stops when user pressed brake
  Given the <brake> system is functional
  When user <press brake pedal>
  Then car <stops>
Examples:
  | brake | press brake pedal | stops |
  | 1 | 2 | 3 |