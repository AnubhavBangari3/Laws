from .models import RuleBasedProfile, MatchPreference
from difflib import SequenceMatcher

def calculate_interest_score(user_interests, candidate_interests):
    if not user_interests or not candidate_interests:
        return 0
    overlap = user_interests.intersection(candidate_interests)
    return (len(overlap) / len(user_interests.union(candidate_interests))) * 100

def match_profiles(user_profile, candidate_profile):
    try:
        user_rule = user_profile.rule_based
        candidate_rule = candidate_profile.rule_based
    except RuleBasedProfile.DoesNotExist:
        return 0

    try:
        user_pref = user_profile.match_preference
    except MatchPreference.DoesNotExist:
        return 0

    score = 0
    total = 0

    # ✅ Gender match (simple match = 20 points)
    total += 20
    if candidate_rule.gender == user_rule.gender:
        score += 20

    # ✅ Religion match (10 points)
    total += 10
    if candidate_rule.religion == user_pref.q5_religion:
        score += 10

    # ✅ Interests overlap (max 30 points)
    total += 30
    user_interests = set(user_rule.interests.values_list('name', flat=True))
    candidate_interests = set(candidate_rule.interests.values_list('name', flat=True))
    score += calculate_interest_score(user_interests, candidate_interests) * (30 / 100)

    # ✅ Preference Questions Matching (10 questions x 4 = 40 points)
    total += 40
    pref_match_weight = 4

    questions = [
        'q1_alcohol', 'q2_smoke', 'q3_children', 'q4_long_distance',
        'q5_religion', 'q6_living_together', 'q7_exercise_partner',
        'q8_community', 'q9_monogamy', 'q10_pets'
    ]

    for q in questions:
        user_answer = getattr(user_pref, q, "").strip().lower()
        candidate_answer = getattr(candidate_rule.profile.match_preference, q, "").strip().lower() \
            if hasattr(candidate_rule.profile, 'match_preference') else ""
        if user_answer and candidate_answer and user_answer == candidate_answer:
            score += pref_match_weight

    # ✅ Final score normalization
    final_score = round((score / total) * 100)
    return final_score
