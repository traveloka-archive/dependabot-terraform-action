module "iam-role_instance" {
  source  = "traveloka/iam-role/aws//modules/instance"
  version = "2.0.2"

  service_name   = "xyzdata"
  cluster_role   = "app"
  product_domain = "xyz"
  environment    = "production"
}
