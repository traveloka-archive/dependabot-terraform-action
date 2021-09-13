module "abc_dev" {
  source  = "traveloka/vpc/aws"
  version = "v0.2.3"
  
  product_domain = "abc"
  environment    = "dev"

  vpc_name       = "abc-dev"
  vpc_cidr_block = "172.16.0.0/16"
}
