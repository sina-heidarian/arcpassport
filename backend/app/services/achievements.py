def clamp_progress(value: int, target: int):
    return min(value, target)


def achievement(
    achievement_id: str,
    title: str,
    description: str,
    progress: int,
    target: int,
    icon: str,
):
    return {
        "id": achievement_id,
        "title": title,
        "description": description,
        "unlocked": progress >= target,
        "progress": clamp_progress(progress, target),
        "target": target,
        "icon": icon,
    }


def build_achievements(passport, stats, deployment_count, total_xp):
    return [
        achievement(
            "first_checkin",
            "First Check-in",
            "Complete your first daily check-in",
            1 if passport.checkin_xp > 0 else 0,
            1,
            "✅",
        ),
        achievement(
            "first_contract",
            "First Contract",
            "Deploy your first smart contract on Arc",
            deployment_count,
            1,
            "🏗️",
        ),
        achievement(
            "builder_i",
            "Builder I",
            "Deploy 3 smart contracts",
            deployment_count,
            3,
            "🛠️",
        ),
        achievement(
            "arc_explorer",
            "Arc Explorer",
            "Complete at least 10 transactions",
            stats["tx_count"],
            10,
            "🧭",
        ),
        achievement(
            "token_mover",
            "Token Mover",
            "Complete at least 10 token transfers",
            stats["token_transfers"],
            10,
            "💸",
        ),
        achievement(
            "streak_starter",
            "Streak Starter",
            "Build a 3-day check-in streak",
            passport.streak,
            3,
            "🔥",
        ),
        achievement(
            "active_builder",
            "Active Builder",
            "Reach 100 Builder XP",
            total_xp,
            100,
            "🔵",
        ),
        achievement(
            "advanced_builder",
            "Advanced Builder",
            "Reach 250 Builder XP",
            total_xp,
            250,
            "🟣",
        ),
    ]
