use thiserror::Error;

#[derive(Debug, Error)]
pub enum DomainError {
    #[error("{0}")]
    Validation(String),
    #[error("forbidden")]
    Forbidden,
    #[error("not found")]
    NotFound,
}

pub type DomainResult<T> = Result<T, DomainError>;
