package repository

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"regexlab/internal/domain"
)

type FileRepository struct {
	mu           sync.RWMutex
	storagePath  string
}

func NewFileRepository(storagePath string) *FileRepository {
	os.MkdirAll(storagePath, 0755)
	return &FileRepository{
		storagePath: storagePath,
	}
}

func (r *FileRepository) Save(regexShare *domain.RegexShare) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	filePath := filepath.Join(r.storagePath, regexShare.ID+".json")

	data, err := json.Marshal(regexShare)
	if err != nil {
		return fmt.Errorf("failed to marshal regex share: %v", err)
	}
	return os.WriteFile(filePath, data, 0644)
}

func (r *FileRepository) FindByID(id string) (*domain.RegexShare, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	filePath := filepath.Join(r.storagePath, id+".json")

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read regex share: %v", err)
	}

	var regexShare domain.RegexShare
	if err := json.Unmarshal(data, &regexShare); err != nil {
		return nil, fmt.Errorf("failed to unmarshal regex share: %v", err)
	}

	if regexShare.IsExpired() {
		os.Remove(filePath)
		return nil, fmt.Errorf("regex share has expired")
	}
	return &regexShare, nil
}

func (r *FileRepository) CleanupExpiredShares() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	files, err := os.ReadDir(r.storagePath)
	if err != nil {
		return err
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filePath := filepath.Join(r.storagePath, file.Name())
		data, err := os.ReadFile(filePath)
		if err != nil {
			continue
		}

		var regexShare domain.RegexShare
		if err := json.Unmarshal(data, &regexShare); err != nil {
			continue
		}

		if regexShare.IsExpired() {
			os.Remove(filePath)
		}
	}
	return nil
}