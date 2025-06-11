module "service_account_notification-service" {
  source       = "./modules/service_account"
  account_id   = "notification-service"
  display_name = "Notification Service Account"
  project_id   = "intricate-pad-455413-f7"
  roles        = [
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/artifactregistry.reader"
  ]
}