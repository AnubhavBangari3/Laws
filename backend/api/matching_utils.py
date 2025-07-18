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
        print("❌ RuleBasedProfile missing for either user or candidate.")
        return 0

    try:
        user_pref = MatchPreference.objects.get(user=user_profile)
    except MatchPreference.DoesNotExist:
        print("❌ MatchPreference missing for user.")
        return 0

    try:
        candidate_pref = MatchPreference.objects.get(user=candidate_profile)
    except MatchPreference.DoesNotExist:
        print(f"❌ MatchPreference missing for candidate: {candidate_profile}")
        return 0

    score = 0
    total = 0

    # ✅ Religion match (10 points)
    total += 10
    if candidate_rule.religion == user_pref.q5_religion:
        score += 10
        print("✅ Religion matched! +10")
    else:
        print("❌ Religion did not match.")

    # ✅ Interests overlap (max 30 points)
    total += 30
    user_interests = set(user_rule.interests.values_list('name', flat=True))
    candidate_interests = set(candidate_rule.interests.values_list('name', flat=True))
    interest_score = calculate_interest_score(user_interests, candidate_interests) * (30 / 100)
    score += interest_score
    print("🎯 Interests Score:", interest_score)
    print("🔹 User Interests:", user_interests)
    print("🔹 Candidate Interests:", candidate_interests)

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
        candidate_answer = getattr(candidate_pref, q, "").strip().lower()
        print(f"🔍 Q: {q} | User: {user_answer} | Candidate: {candidate_answer}")
        if user_answer and candidate_answer and user_answer == candidate_answer:
            score += pref_match_weight
            print(f"✅ Matched {q}! +{pref_match_weight}")
        else:
            print(f"❌ No match on {q}")

    final_score = round((score / total) * 100)
    print("🎯 Final Score:", final_score)
    return final_score

