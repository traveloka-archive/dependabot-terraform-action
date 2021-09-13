module "abc_dev" {
  source  = "traveloka/vpc/aws"
  version = "v0.2.3"

  product_domain = "abcd"
  environment    = "dev"

  vpc_name       = "abcd-dev"
  vpc_cidr_block = "172.17.0.0/24"
}
