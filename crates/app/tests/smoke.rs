//! Integration tests: the crate as another crate sees it, public API only.

#[test]
fn add_is_commutative() {
  assert_eq!(app::add(3, 4), app::add(4, 3));
}
