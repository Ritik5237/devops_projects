output "vpc_id" {
  description = "The ID of the TaskFlow VPC"
  value       = aws_vpc.taskflow_vpc.id
}

output "public_subnet_id" {
  description = "The ID of the public subnet"
  value       = aws_subnet.taskflow_public_subnet.id
}

output "taskflow_node_public_ip" {
  description = "Public IP address of the TaskFlow Kubernetes / App Node"
  value       = aws_instance.taskflow_node.public_ip
}

output "taskflow_web_url" {
  description = "Direct web URL to access TaskFlow on the cloud node"
  value       = "http://${aws_instance.taskflow_node.public_ip}:5050"
}

output "taskflow_k8s_nodeport_url" {
  description = "Kubernetes NodePort web URL for TaskFlow"
  value       = "http://${aws_instance.taskflow_node.public_ip}:30080"
}

output "jenkins_server_public_ip" {
  description = "Public IP address of the dedicated Jenkins CI/CD controller"
  value       = aws_instance.jenkins_server.public_ip
}

output "jenkins_url" {
  description = "Web URL for Jenkins automation dashboard"
  value       = "http://${aws_instance.jenkins_server.public_ip}:8080"
}

output "ssh_command_node" {
  description = "SSH command to connect to the TaskFlow node"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_instance.taskflow_node.public_ip}"
}

output "ssh_command_jenkins" {
  description = "SSH command to connect to the Jenkins server"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_instance.jenkins_server.public_ip}"
}
