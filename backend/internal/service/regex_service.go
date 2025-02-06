package service

import (
	"errors"
	"regexp"
	"regexlab/internal/domain"
	"regexlab/internal/repository"
)

type RegexService struct {
	repo *repository.FileRepository
}

func NewRegexService(repo *repository.FileRepository) *RegexService {
	return &RegexService{repo: repo}
}

func (s *RegexService) ValidateRegex(pattern string) bool {
	_, err := regexp.Compile(pattern)
	return err == nil
}

func (s *RegexService) TestRegex(pattern, testString string) ([]string, error) {
	if !s.ValidateRegex(pattern) {
		return nil, errors.New("invalid regex pattern")
	}
	regex, err := regexp.Compile(pattern)
	if err != nil {
		return nil, err
	}
	matches := regex.FindAllString(testString, -1)
	return matches, nil
}

func (s *RegexService) ShareRegex(pattern, testString string) (*domain.RegexShare, error) {
	if !s.ValidateRegex(pattern) {
		return nil, errors.New("invalid regex pattern")
	}
	regexShare := domain.NewRegexShare(pattern, testString)
	if err := s.repo.Save(regexShare); err != nil {
		return nil, err
	}
	return regexShare, nil
}

func (s *RegexService) GetSharedRegex(id string) (*domain.RegexShare, error) {
	return s.repo.FindByID(id)
}