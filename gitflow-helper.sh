#!/bin/bash

# 🚀 Gitflow Helper Script para sitio-luz
# Automatiza las operaciones comunes de Gitflow

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${CYAN}🚀 Gitflow Helper para sitio-luz${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC} ./gitflow-helper.sh [comando] [opciones]"
    echo ""
    echo -e "${GREEN}Comandos disponibles:${NC}"
    echo "  feature <nombre>     - Crear nueva feature branch"
    echo "  release <version>    - Crear release branch"
    echo "  hotfix <version>     - Crear hotfix branch"
    echo "  finish-feature       - Finalizar feature actual"
    echo "  finish-release       - Finalizar release actual"
    echo "  finish-hotfix        - Finalizar hotfix actual"
    echo "  tag <version> <msg>  - Crear tag con mensaje"
    echo "  status               - Mostrar estado actual"
    echo "  help                 - Mostrar esta ayuda"
    echo ""
    echo -e "${YELLOW}Ejemplos:${NC}"
    echo "  ./gitflow-helper.sh feature nueva-galeria"
    echo "  ./gitflow-helper.sh release v1.3.0"
    echo "  ./gitflow-helper.sh tag v1.2.2 '🔧 Fix critical bug'"
}

# Función para verificar que estamos en un repositorio Git
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: No estás en un repositorio Git${NC}"
        exit 1
    fi
}

# Función para verificar que develop existe
check_develop_branch() {
    if ! git show-ref --verify --quiet refs/heads/develop; then
        echo -e "${RED}❌ Error: La rama 'develop' no existe${NC}"
        echo -e "${YELLOW}💡 Sugerencia: Crea la rama develop primero${NC}"
        exit 1
    fi
}

# Función para crear feature branch
create_feature() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo -e "${RED}❌ Error: Debes especificar un nombre para la feature${NC}"
        echo "Uso: ./gitflow-helper.sh feature <nombre>"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Creando feature branch: feature/$feature_name${NC}"
    
    # Actualizar develop
    git checkout develop
    git pull origin develop
    
    # Crear feature branch
    git checkout -b "feature/$feature_name"
    
    echo -e "${GREEN}✅ Feature branch 'feature/$feature_name' creada${NC}"
    echo -e "${YELLOW}💡 Ahora puedes desarrollar tu funcionalidad${NC}"
}

# Función para crear release branch
create_release() {
    local version=$1
    if [ -z "$version" ]; then
        echo -e "${RED}❌ Error: Debes especificar una versión${NC}"
        echo "Uso: ./gitflow-helper.sh release <version>"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Creando release branch: release/$version${NC}"
    
    # Actualizar develop
    git checkout develop
    git pull origin develop
    
    # Crear release branch
    git checkout -b "release/$version"
    
    echo -e "${GREEN}✅ Release branch 'release/$version' creada${NC}"
    echo -e "${YELLOW}💡 Haz los ajustes finales y luego usa: finish-release${NC}"
}

# Función para crear hotfix branch
create_hotfix() {
    local version=$1
    if [ -z "$version" ]; then
        echo -e "${RED}❌ Error: Debes especificar una versión${NC}"
        echo "Uso: ./gitflow-helper.sh hotfix <version>"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Creando hotfix branch: hotfix/$version${NC}"
    
    # Actualizar main
    git checkout main
    git pull origin main
    
    # Crear hotfix branch
    git checkout -b "hotfix/$version"
    
    echo -e "${GREEN}✅ Hotfix branch 'hotfix/$version' creada${NC}"
    echo -e "${YELLOW}💡 Haz la corrección y luego usa: finish-hotfix${NC}"
}

# Función para finalizar feature
finish_feature() {
    local current_branch=$(git branch --show-current)
    
    if [[ ! $current_branch =~ ^feature/ ]]; then
        echo -e "${RED}❌ Error: No estás en una feature branch${NC}"
        echo "Rama actual: $current_branch"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Finalizando feature: $current_branch${NC}"
    
    # Merge a develop
    git checkout develop
    git pull origin develop
    git merge "$current_branch" --no-ff -m "✨ Merge $current_branch into develop"
    
    # Eliminar feature branch
    git branch -d "$current_branch"
    git push origin develop
    
    echo -e "${GREEN}✅ Feature finalizada y mergeada a develop${NC}"
}

# Función para finalizar release
finish_release() {
    local current_branch=$(git branch --show-current)
    
    if [[ ! $current_branch =~ ^release/ ]]; then
        echo -e "${RED}❌ Error: No estás en una release branch${NC}"
        echo "Rama actual: $current_branch"
        exit 1
    fi
    
    local version=${current_branch#release/}
    
    echo -e "${BLUE}🔄 Finalizando release: $current_branch${NC}"
    
    # Merge a main
    git checkout main
    git pull origin main
    git merge "$current_branch" --no-ff -m "🎉 Release $version"
    
    # Crear tag
    git tag -a "v$version" -m "🎉 Release $version"
    
    # Merge a develop
    git checkout develop
    git pull origin develop
    git merge "$current_branch" --no-ff -m "🔄 Merge release $version into develop"
    
    # Eliminar release branch
    git checkout main
    git branch -d "$current_branch"
    
    # Push cambios
    git push origin main
    git push origin develop
    git push origin "v$version"
    
    echo -e "${GREEN}✅ Release $version finalizada${NC}"
    echo -e "${YELLOW}🎉 Tag v$version creado y subido${NC}"
}

# Función para finalizar hotfix
finish_hotfix() {
    local current_branch=$(git branch --show-current)
    
    if [[ ! $current_branch =~ ^hotfix/ ]]; then
        echo -e "${RED}❌ Error: No estás en una hotfix branch${NC}"
        echo "Rama actual: $current_branch"
        exit 1
    fi
    
    local version=${current_branch#hotfix/}
    
    echo -e "${BLUE}🔄 Finalizando hotfix: $current_branch${NC}"
    
    # Merge a main
    git checkout main
    git pull origin main
    git merge "$current_branch" --no-ff -m "🔧 Hotfix $version"
    
    # Crear tag
    git tag -a "v$version" -m "🔧 Hotfix $version"
    
    # Merge a develop
    git checkout develop
    git pull origin develop
    git merge "$current_branch" --no-ff -m "🔄 Merge hotfix $version into develop"
    
    # Eliminar hotfix branch
    git checkout main
    git branch -d "$current_branch"
    
    # Push cambios
    git push origin main
    git push origin develop
    git push origin "v$version"
    
    echo -e "${GREEN}✅ Hotfix $version finalizado${NC}"
    echo -e "${YELLOW}🔧 Tag v$version creado y subido${NC}"
}

# Función para crear tag
create_tag() {
    local version=$1
    local message=$2
    
    if [ -z "$version" ]; then
        echo -e "${RED}❌ Error: Debes especificar una versión${NC}"
        echo "Uso: ./gitflow-helper.sh tag <version> <mensaje>"
        exit 1
    fi
    
    if [ -z "$message" ]; then
        message="🎉 Release $version"
    fi
    
    echo -e "${BLUE}🏷️ Creando tag: v$version${NC}"
    
    git tag -a "v$version" -m "$message"
    git push origin "v$version"
    
    echo -e "${GREEN}✅ Tag v$version creado y subido${NC}"
}

# Función para mostrar estado
show_status() {
    echo -e "${CYAN}📊 Estado actual del repositorio:${NC}"
    echo ""
    
    local current_branch=$(git branch --show-current)
    echo -e "${YELLOW}🌿 Rama actual:${NC} $current_branch"
    
    echo ""
    echo -e "${YELLOW}📋 Branches disponibles:${NC}"
    git branch -a | grep -E "(main|develop|feature|release|hotfix)" | sed 's/^/  /'
    
    echo ""
    echo -e "${YELLOW}🏷️ Tags disponibles:${NC}"
    git tag -l | tail -10 | sed 's/^/  /'
    
    echo ""
    echo -e "${YELLOW}📈 Últimos commits:${NC}"
    git log --oneline -5 | sed 's/^/  /'
}

# Función principal
main() {
    check_git_repo
    
    case "$1" in
        "feature")
            check_develop_branch
            create_feature "$2"
            ;;
        "release")
            check_develop_branch
            create_release "$2"
            ;;
        "hotfix")
            create_hotfix "$2"
            ;;
        "finish-feature")
            finish_feature
            ;;
        "finish-release")
            finish_release
            ;;
        "finish-hotfix")
            finish_hotfix
            ;;
        "tag")
            create_tag "$2" "$3"
            ;;
        "status")
            show_status
            ;;
        "help"|"-h"|"--help"|"")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Comando desconocido: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@" 