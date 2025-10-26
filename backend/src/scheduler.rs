use crate::clients::{GatcgApiClient, OmnidexApiClient, OmniWebApiClient};
use crate::config::Config;
use crate::services::{EventCrawler, CardSyncService, MetaAnalysisService};
use mongodb::Database;
use tokio_cron_scheduler::{Job, JobScheduler};
use log::{info, error};
use std::sync::Arc;

/// Initialize and configure the job scheduler
pub async fn setup_scheduler(
    config: Config,
    database: Database,
) -> Result<JobScheduler, anyhow::Error> {
    info!("Setting up job scheduler");

    let scheduler = JobScheduler::new().await?;

    // Create API clients
    let omnidex_client = Arc::new(OmnidexApiClient::new(
        config.request_delay_ms,
        config.request_timeout_secs,
        config.max_retries,
    ));

    let omni_web_client = Arc::new(OmniWebApiClient::new(
        config.request_delay_ms,
        config.request_timeout_secs,
        config.max_retries,
    ));

    let gatcg_client = Arc::new(GatcgApiClient::new(
        config.request_delay_ms,
        config.request_timeout_secs,
        config.max_retries,
    ));

    // Daily incremental event crawl at 02:00 UTC
    {
        let db = database.clone();
        let omnidex = omnidex_client.clone();
        let omni_web = omni_web_client.clone();
        let max_404s = config.crawler_max_404s;

        let job = Job::new_async("0 0 2 * * *", move |_uuid, _lock| {
            let db = db.clone();
            let omnidex = omnidex.clone();
            let omni_web = omni_web.clone();

            Box::pin(async move {
                info!("Starting scheduled incremental event crawl");

                let crawler = EventCrawler::new(omnidex, omni_web, db, max_404s);

                match crawler.crawl_incremental().await {
                    Ok(last_id) => {
                        info!("Incremental event crawl completed successfully. Last ID: {}", last_id);
                    }
                    Err(e) => {
                        error!("Incremental event crawl failed: {}", e);
                    }
                }
            })
        })?;

        scheduler.add(job).await?;
        info!("Scheduled: Incremental event crawl at 02:00 UTC daily");
    }

    // Daily card sync at 03:00 UTC
    {
        let db = database.clone();
        let gatcg = gatcg_client.clone();

        let job = Job::new_async("0 0 3 * * *", move |_uuid, _lock| {
            let db = db.clone();
            let gatcg = gatcg.clone();

            Box::pin(async move {
                info!("Starting scheduled card sync");

                let card_sync = CardSyncService::new(gatcg, db);

                match card_sync.full_sync().await {
                    Ok((champions, cards)) => {
                        info!(
                            "Card sync completed successfully. Champions: {}, Cards: {}",
                            champions, cards
                        );
                    }
                    Err(e) => {
                        error!("Card sync failed: {}", e);
                    }
                }
            })
        })?;

        scheduler.add(job).await?;
        info!("Scheduled: Card sync at 03:00 UTC daily");
    }

    // Daily meta analysis at 06:00 UTC
    {
        let db = database.clone();

        let job = Job::new_async("0 0 6 * * *", move |_uuid, _lock| {
            let db = db.clone();

            Box::pin(async move {
                info!("Starting scheduled meta analysis");

                let meta_service = MetaAnalysisService::new(db);

                // Calculate various meta statistics
                match meta_service.calculate_meta_breakdown(None, Some(30)).await {
                    Ok(breakdown) => {
                        info!(
                            "Meta breakdown calculated: {} champions in last 30 days",
                            breakdown.len()
                        );
                    }
                    Err(e) => {
                        error!("Meta breakdown calculation failed: {}", e);
                    }
                }

                match meta_service.calculate_champion_performance(Some(30)).await {
                    Ok(performance) => {
                        info!(
                            "Champion performance calculated: {} champions",
                            performance.len()
                        );
                    }
                    Err(e) => {
                        error!("Champion performance calculation failed: {}", e);
                    }
                }
            })
        })?;

        scheduler.add(job).await?;
        info!("Scheduled: Meta analysis at 06:00 UTC daily");
    }

    Ok(scheduler)
}

/// Start the scheduler
pub async fn start_scheduler(scheduler: JobScheduler) -> Result<(), Box<dyn std::error::Error>> {
    scheduler.start().await?;
    info!("Job scheduler started successfully");
    Ok(())
}
