from app.routes.main_routes import (
    build_rooks_trace,
    count_placed_pieces,
    normalize_board,
    parse_board_size,
    parse_favorite_flag,
    parse_non_negative_int,
    solve_queens,
)


def test_parse_board_size_clamps_small_large_and_invalid_values():
    assert parse_board_size("2") == 4
    assert parse_board_size("99") == 13
    assert parse_board_size("abc") == 8


def test_parse_favorite_flag_accepts_common_truthy_values():
    assert parse_favorite_flag("true") is True
    assert parse_favorite_flag("1") is True
    assert parse_favorite_flag("on") is True
    assert parse_favorite_flag("false") is False


def test_parse_non_negative_int_clamps_negative_and_invalid_values():
    assert parse_non_negative_int("-7") == 0
    assert parse_non_negative_int("15") == 15
    assert parse_non_negative_int("abc", default=3) == 3


def test_normalize_board_converts_legacy_position_list_into_matrix():
    normalized = normalize_board([1, 3, 0, 2], 4)

    assert normalized == [
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 0],
        [0, 0, 1, 0],
    ]


def test_normalize_board_reduces_matrix_values_to_zero_or_one():
    normalized = normalize_board([[0, 2], [True, None]], 2)

    assert normalized == [[0, 1], [1, 0]]


def test_solve_queens_returns_the_two_expected_solutions_for_4x4():
    solutions = {tuple(solution) for solution in solve_queens(4)}

    assert solutions == {
        (1, 3, 0, 2),
        (2, 0, 3, 1),
    }


def test_build_rooks_trace_contains_one_placement_per_row_plus_solution():
    trace = build_rooks_trace(5)
    placement_steps = [step for step in trace["steps"] if step["type"] == "place"]

    assert trace["solved"] is True
    assert len(trace["steps"]) == 6
    assert len(placement_steps) == 5
    assert sorted(step["col"] for step in placement_steps) == [0, 1, 2, 3, 4]
    assert count_placed_pieces(trace["steps"][-1]["board"]) == 5
