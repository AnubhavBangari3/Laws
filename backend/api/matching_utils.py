from .models import RuleBasedProfile, MatchPreference, UserPersonalityProfile
from difflib import SequenceMatcher

MBTI_COMPATIBILITY = {
    "ISTJ": {"best": ["ESTP", "ESFP"], "good": ["ISFJ", "INTJ"]},
    "ISFJ": {"best": ["ESFP", "ESTP"], "good": ["ISTJ", "INFJ"]},
    "INFJ": {"best": ["ENFP", "ENTP"], "good": ["INFP", "INTJ"]},
    "INTJ": {"best": ["ENFP", "ENTP"], "good": ["INTP", "INFJ"]},
    "ISTP": {"best": ["ESFJ", "ESTJ"], "good": ["ISFP", "INTP"]},
    "ISFP": {"best": ["ESFJ", "ESTJ"], "good": ["INFP", "ISFJ"]},
    "INFP": {"best": ["ENFJ", "ENTJ"], "good": ["INFJ", "ISFP"]},
    "INTP": {"best": ["ENTJ", "ENFJ"], "good": ["INFP", "ISTP"]},
    "ESTP": {"best": ["ISFJ", "ISTJ"], "good": ["ESFP", "ESTJ"]},
    "ESFP": {"best": ["ISFJ", "ISTJ"], "good": ["ESFP", "ENFP"]},
    "ENFP": {"best": ["INFJ", "INTJ"], "good": ["INFP", "ENTP"]},
    "ENTP": {"best": ["INFJ", "INTJ"], "good": ["INTP", "ENFP"]},
    "ESTJ": {"best": ["ISFP", "ISTP"], "good": ["ESFJ", "ESTP"]},
    "ESFJ": {"best": ["ISFP", "ISTP"], "good": ["ESFP", "ESTJ"]},
    "ENFJ": {"best": ["INFP", "INTP"], "good": ["ENFP", "INFJ"]},
    "ENTJ": {"best": ["INFP", "INTP"], "good": ["ENTP", "INTJ"]},
}


def calculate_interest_score(user_interests, candidate_interests):
    if not user_interests or not candidate_interests:
        return 0
    overlap = user_interests.intersection(candidate_interests)
    return (len(overlap) / len(user_interests.union(candidate_interests))) * 100


def get_mbti_score(user_mbti, candidate_mbti):
    if not user_mbti or not candidate_mbti:
        print("❌ MBTI missing for user or candidate.")
        return 0

    user_mbti = user_mbti.upper()
    candidate_mbti = candidate_mbti.upper()

    match_data = MBTI_COMPATIBILITY.get(user_mbti)
    if not match_data:
        return 0

    if candidate_mbti in match_data["best"]:
        print(f"💖 Best MBTI Match: {user_mbti} ↔ {candidate_mbti} (+20)")
        return 20
    elif candidate_mbti in match_data["good"]:
        print(f"👍 Good MBTI Match: {user_mbti} ↔ {candidate_mbti} (+10)")
        return 10
    else:
        print(f"⚠️ Challenging MBTI Match: {user_mbti} ↔ {candidate_mbti} (+0)")
        return 0


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

    # ✅ MBTI Compatibility (Best: 20, Good: 10, Else: 0)
    total += 20
    user_mbti = getattr(user_profile.mbti_user, 'predicted_mbti', None)
    candidate_mbti = getattr(candidate_profile.mbti_user, 'predicted_mbti', None)
    mbti_score = get_mbti_score(user_mbti, candidate_mbti)
    score += mbti_score

    final_score = round((score / total) * 100)
    print("🎯 Final Score:", final_score)
    return final_score
