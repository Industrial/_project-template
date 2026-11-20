//! Placeholder library crate for the workspace.
//!
//! Keep logic here and the binary in `main.rs` thin, so integration tests in
//! `tests/` and other crates can reach everything the binary can.

/// Adds two numbers.
///
/// ```
/// assert_eq!(app::add(2, 2), 4);
/// ```
#[must_use]
pub fn add(left: u64, right: u64) -> u64 {
  left + right
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn adds() {
    assert_eq!(add(2, 2), 4);
  }
}
