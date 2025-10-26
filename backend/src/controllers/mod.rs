pub mod champions;
pub mod events;
pub mod decklists;
pub mod meta;
pub mod health;

pub use champions::configure as configure_champions;
pub use events::configure as configure_events;
pub use decklists::configure as configure_decklists;
pub use meta::configure as configure_meta;
pub use health::configure as configure_health;
