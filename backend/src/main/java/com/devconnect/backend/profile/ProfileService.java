package com.devconnect.backend.profile;

import com.devconnect.backend.entity.User;
import com.devconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getJoinDate() == null) {
            user.setJoinDate(java.time.LocalDateTime.now().minusMonths(6));
        }
        user.setProfileViews(user.getProfileViews() + 1);
        return userRepository.save(user);
    }

    public User updateUser(Long id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(updatedUser.getName());
        user.setBio(updatedUser.getBio());
        user.setCoverBanner(updatedUser.getCoverBanner());
        user.setProfilePicture(updatedUser.getProfilePicture());
        user.setUsername(updatedUser.getUsername());
        user.setHeadline(updatedUser.getHeadline());
        user.setCurrentRole(updatedUser.getCurrentRole());
        user.setCompany(updatedUser.getCompany());
        user.setCollege(updatedUser.getCollege());
        user.setLocation(updatedUser.getLocation());

        // Update child collections. Set back-references to parent User.
        if (updatedUser.getSkills() != null) {
            updatedUser.getSkills().forEach(s -> s.setUser(user));
            user.setSkills(updatedUser.getSkills());
        }
        if (updatedUser.getProjects() != null) {
            updatedUser.getProjects().forEach(p -> p.setUser(user));
            user.setProjects(updatedUser.getProjects());
        }
        if (updatedUser.getExperiences() != null) {
            updatedUser.getExperiences().forEach(e -> e.setUser(user));
            user.setExperiences(updatedUser.getExperiences());
        }
        if (updatedUser.getEducations() != null) {
            updatedUser.getEducations().forEach(ed -> ed.setUser(user));
            user.setEducations(updatedUser.getEducations());
        }
        if (updatedUser.getCertifications() != null) {
            updatedUser.getCertifications().forEach(c -> c.setUser(user));
            user.setCertifications(updatedUser.getCertifications());
        }

        return userRepository.save(user);
    }

    public List<User> searchUsers(String name) {
        return userRepository.findByNameContainingIgnoreCase(name);
    }
}